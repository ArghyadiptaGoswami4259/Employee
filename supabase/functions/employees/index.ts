import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import mongoose from "npm:mongoose@8";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

// ── MongoDB connection ────────────────────────────────────────────────────────
// Reuse the connection across warm function instances.
let connected = false;

async function connectDB(): Promise<void> {
  const uri = Deno.env.get("MONGODB_URI");
  if (!uri) {
    throw new Error(
      "MONGODB_URI is not configured. " +
      "Add it to your Supabase project secrets (Settings → Edge Functions → Secrets)."
    );
  }
  if (connected && mongoose.connection.readyState === 1) return;
  await mongoose.connect(uri, { bufferCommands: false });
  connected = true;
}

// ── Employee model ────────────────────────────────────────────────────────────
const employeeSchema = new mongoose.Schema(
  {
    first_name: { type: String, required: [true, "First name is required"], trim: true },
    last_name:  { type: String, required: [true, "Last name is required"],  trim: true },
    email:      { type: String, required: [true, "Email is required"], unique: true, lowercase: true, trim: true },
    phone:      { type: String, default: null },
    department: { type: String, required: [true, "Department is required"] },
    position:   { type: String, required: [true, "Position is required"] },
    salary:     { type: Number, min: [0, "Salary must be positive"], default: null },
    hire_date:  { type: Date,   required: [true, "Hire date is required"] },
    status:     { type: String, enum: ["active", "inactive"], default: "active" },
  },
  { timestamps: true }
);

const Employee =
  (mongoose.models["Employee"] as mongoose.Model<mongoose.Document>) ||
  mongoose.model("Employee", employeeSchema);

// ── Helpers ───────────────────────────────────────────────────────────────────
function json(data: unknown, status = 200): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

function errorResponse(message: string, status = 400): Response {
  return json({ error: message }, status);
}

function normalizeDoc(doc: Record<string, unknown>): Record<string, unknown> {
  const { _id, __v, ...rest } = doc;
  return { id: String(_id), ...rest };
}

// ── Router ────────────────────────────────────────────────────────────────────
Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  // Connect — surface a clear 503 if MONGODB_URI is missing or unreachable
  try {
    await connectDB();
  } catch (e) {
    return errorResponse((e as Error).message, 503);
  }

  const url = new URL(req.url);
  const segments = url.pathname.replace(/^\/+|\/+$/g, "").split("/");
  // Path shape: functions/v1/employees  OR  functions/v1/employees/:id
  const maybeId = segments[segments.length - 1];
  const id = maybeId !== "employees" ? maybeId : null;

  try {
    // ── GET /employees ──────────────────────────────────────────────────────
    if (req.method === "GET" && !id) {
      const page   = Math.max(1, parseInt(url.searchParams.get("page")  || "1"));
      const limit  = Math.max(1, Math.min(100, parseInt(url.searchParams.get("limit") || "10")));
      const search = url.searchParams.get("search")     || "";
      const dept   = url.searchParams.get("department") || "";
      const status = url.searchParams.get("status")     || "";
      const sf     = url.searchParams.get("sortField")  || "createdAt";
      const sd     = url.searchParams.get("sortDir")    || "desc";

      const SORT_FIELDS: Record<string, string> = {
        last_name: "last_name", department: "department", position: "position",
        salary: "salary", hire_date: "hire_date", status: "status", createdAt: "createdAt",
      };

      const filter: Record<string, unknown> = {};
      if (search) {
        const rx = new RegExp(search, "i");
        filter.$or = [
          { first_name: rx }, { last_name: rx }, { email: rx }, { position: rx },
        ];
      }
      if (dept)   filter.department = dept;
      if (status) filter.status     = status;

      const sortKey = SORT_FIELDS[sf] ?? "createdAt";
      const sort: Record<string, 1 | -1> = { [sortKey]: sd === "asc" ? 1 : -1 };

      const [rawDocs, total] = await Promise.all([
        Employee.find(filter).sort(sort).skip((page - 1) * limit).limit(limit).lean(),
        Employee.countDocuments(filter),
      ]);

      const employees = (rawDocs as Record<string, unknown>[]).map(normalizeDoc);
      return json({ employees, total, page, limit });
    }

    // ── GET /employees/:id ──────────────────────────────────────────────────
    if (req.method === "GET" && id) {
      const doc = await Employee.findById(id).lean() as Record<string, unknown> | null;
      if (!doc) return errorResponse("Employee not found", 404);
      return json(normalizeDoc(doc));
    }

    // ── POST /employees ─────────────────────────────────────────────────────
    if (req.method === "POST") {
      const body = await req.json();
      const employee = (await Employee.create(body)).toObject() as Record<string, unknown>;
      return json(normalizeDoc(employee), 201);
    }

    // ── PUT /employees/:id ──────────────────────────────────────────────────
    if (req.method === "PUT" && id) {
      const body = await req.json();
      const doc = await Employee.findByIdAndUpdate(id, body, {
        new: true,
        runValidators: true,
      }).lean() as Record<string, unknown> | null;
      if (!doc) return errorResponse("Employee not found", 404);
      return json(normalizeDoc(doc));
    }

    // ── DELETE /employees/:id ───────────────────────────────────────────────
    if (req.method === "DELETE" && id) {
      const doc = await Employee.findByIdAndDelete(id).lean() as Record<string, unknown> | null;
      if (!doc) return errorResponse("Employee not found", 404);
      return json({ message: "Employee deleted successfully" });
    }

    return errorResponse("Not found", 404);
  } catch (e) {
    const error = e as { code?: number; name?: string; errors?: Record<string, { message: string }>; message?: string };

    if (error.code === 11000) {
      return errorResponse("An employee with this email already exists.", 409);
    }
    if (error.name === "ValidationError" && error.errors) {
      const msg = Object.values(error.errors).map((v) => v.message).join(", ");
      return errorResponse(msg, 422);
    }
    if (error.name === "CastError") {
      return errorResponse("Invalid employee ID", 400);
    }
    return errorResponse(error.message ?? "Internal server error", 500);
  }
});
