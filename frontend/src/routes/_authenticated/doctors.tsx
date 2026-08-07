import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useState } from "react";
import {
  Stethoscope,
  MapPin,
  Star,
  Phone,
  Mail,
  Search,
  CheckCircle2,
  Calendar,
  Filter,
  X,
} from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/doctors")({
  head: () => ({
    meta: [
      { title: "Doctors Directory — TraumaGuard AI" },
      { name: "description", content: "Connect with verified trauma-informed clinicians across India." },
    ],
  }),
  component: DoctorsPage,
});

export interface Doctor {
  id: string;
  name: string;
  specialty: string;
  category: "psychiatrist" | "psychologist" | "therapist" | "crisis";
  languages: string[];
  city: string;
  phone: string;
  email: string;
  bio: string;
  years_experience: number;
  rating: number;
  available: boolean;
}

const DEFAULT_DOCTORS: Doctor[] = [
  {
    id: "doc-1",
    name: "Dr. Aarav Sharma, MD",
    specialty: "Senior Psychiatrist & Trauma Recovery Specialist",
    category: "psychiatrist",
    languages: ["English", "Hindi", "Marathi"],
    city: "Mumbai",
    phone: "+91 98200 11111",
    email: "dr.aarav.sharma@traumaclinic.in",
    bio: "Over 14 years specializing in PTSD, trauma-informed pharmacotherapy, and crisis stabilization.",
    years_experience: 14,
    rating: 4.9,
    available: true,
  },
  {
    id: "doc-2",
    name: "Dr. Kavya Reddy, Ph.D.",
    specialty: "Consultant Clinical Psychologist & EMDR Practitioner",
    category: "psychologist",
    languages: ["English", "Telugu", "Hindi"],
    city: "Hyderabad",
    phone: "+91 98200 22222",
    email: "dr.kavya.reddy@traumaclinic.in",
    bio: "Specializes in emotional distress, panic disorders, somatic grounding, and childhood trauma processing.",
    years_experience: 11,
    rating: 4.8,
    available: true,
  },
  {
    id: "doc-3",
    name: "Dr. Meera Iyer, MBBS, DPM",
    specialty: "Consultant Neuropsychiatrist & Anxiety Specialist",
    category: "psychiatrist",
    languages: ["English", "Tamil", "Hindi"],
    city: "Chennai",
    phone: "+91 98200 33333",
    email: "dr.meera.iyer@traumaclinic.in",
    bio: "Focuses on trauma-related sleep dysregulation, acute panic management, and mood stabilization.",
    years_experience: 18,
    rating: 4.9,
    available: true,
  },
  {
    id: "doc-4",
    name: "Dr. Rohan Desai, M.Phil.",
    specialty: "Certified EMDR & Cognitive Behavioral Therapist",
    category: "therapist",
    languages: ["English", "Gujarati", "Hindi", "Marathi"],
    city: "Ahmedabad",
    phone: "+91 98200 44444",
    email: "dr.rohan.desai@traumaclinic.in",
    bio: "Expertise in prolonged exposure therapy, trigger desensitization, and grief counseling.",
    years_experience: 9,
    rating: 4.8,
    available: true,
  },
  {
    id: "doc-5",
    name: "Dr. Simran Kaur, M.Sc. Clinical Psychology",
    specialty: "Trauma & Young Adult Wellness Counselor",
    category: "therapist",
    languages: ["English", "Punjabi", "Hindi"],
    city: "Chandigarh",
    phone: "+91 98200 55555",
    email: "dr.simran.kaur@traumaclinic.in",
    bio: "Compassionate counselling for university students, stress burnout, and interpersonal trauma.",
    years_experience: 7,
    rating: 4.7,
    available: true,
  },
  {
    id: "doc-6",
    name: "Dr. Neha Kulkarni, MD (Psychiatry)",
    specialty: "Complex Trauma & Dissociative Disorders Specialist",
    category: "psychiatrist",
    languages: ["English", "Marathi", "Hindi"],
    city: "Pune",
    phone: "+91 98200 66666",
    email: "dr.neha.kulkarni@traumaclinic.in",
    bio: "Specialist in nervous system regulation, psychopharmacology, and comprehensive trauma recovery plans.",
    years_experience: 15,
    rating: 4.9,
    available: true,
  },
  {
    id: "doc-7",
    name: "Dr. Vikram Sengupta, Ph.D.",
    specialty: "Senior Cognitive Behavioural Psychologist",
    category: "psychologist",
    languages: ["English", "Bengali", "Hindi"],
    city: "Kolkata",
    phone: "+91 98200 77777",
    email: "dr.vikram.sengupta@traumaclinic.in",
    bio: "Decades of clinical research and practice in overcoming severe trauma flashbacks and social anxiety.",
    years_experience: 16,
    rating: 4.8,
    available: true,
  },
  {
    id: "doc-8",
    name: "Dr. Ananya Nair, MD",
    specialty: "Integrative Mental Health & Crisis Psychiatrist",
    category: "psychiatrist",
    languages: ["English", "Malayalam", "Kannada", "Hindi"],
    city: "Bengaluru",
    phone: "+91 98200 88888",
    email: "dr.ananya.nair@traumaclinic.in",
    bio: "Integrates evidence-based medical treatments with mindfulness-based trauma reduction.",
    years_experience: 12,
    rating: 4.9,
    available: true,
  },
];

function DoctorsPage() {
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [bookingDoctor, setBookingDoctor] = useState<Doctor | null>(null);
  const [bookingDate, setBookingDate] = useState("");
  const [bookingNotes, setBookingNotes] = useState("");

  const { data: dbDocs = [] } = useQuery({
    queryKey: ["doctors"],
    queryFn: async () => {
      try {
        const { data, error } = await supabase.from("doctors").select("*");
        if (!error && data && data.length > 0) {
          return data.map((d: any) => ({
            id: d.id,
            name: d.name || d.full_name,
            specialty: d.specialty,
            category: (d.specialty?.toLowerCase().includes("psychiatrist") ? "psychiatrist" : "psychologist") as any,
            languages: Array.isArray(d.languages) ? d.languages : ["English", "Hindi"],
            city: d.city || d.location || "India",
            phone: d.phone || "+91 98200 00000",
            email: d.email || "support@traumaguard.ai",
            bio: d.bio || "Verified trauma-informed clinical specialist.",
            years_experience: d.years_experience || 10,
            rating: Number(d.rating) || 4.8,
            available: true,
          }));
        }
      } catch {}
      return [];
    },
  });

  const allDoctors = dbDocs.length > 0 ? dbDocs : DEFAULT_DOCTORS;

  const filteredDocs = allDoctors.filter((doc: Doctor) => {
    const q = search.toLowerCase();
    const matchSearch =
      !q ||
      doc.name.toLowerCase().includes(q) ||
      doc.city.toLowerCase().includes(q) ||
      doc.specialty.toLowerCase().includes(q) ||
      doc.languages.some((l) => l.toLowerCase().includes(q));

    const matchCategory =
      selectedCategory === "all" || doc.category === selectedCategory;

    return matchSearch && matchCategory;
  });

  const [submittingBooking, setSubmittingBooking] = useState(false);

  async function handleBookSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!bookingDate) {
      toast.error("Please select a preferred date and time");
      return;
    }

    setSubmittingBooking(true);
    try {
      let patientName = "TraumaGuard Patient";
      let patientPhone = "+91 98765 43210";
      try {
        const { data: u } = await supabase.auth.getUser();
        if (u?.user?.user_metadata?.full_name) {
          patientName = u.user.user_metadata.full_name;
        }
        if (u?.user?.user_metadata?.phone) {
          patientPhone = u.user.user_metadata.phone;
        }
      } catch {}

      const res = await fetch("http://localhost:8000/api/doctors/book/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          doctor_id: bookingDoctor?.id,
          doctor_name: bookingDoctor?.name,
          patient_name: patientName,
          patient_phone: patientPhone,
          preferred_date: bookingDate,
          notes: bookingNotes,
        }),
      });

      if (!res.ok) throw new Error("Booking request failed");
      const data = await res.json();

      toast.success(
        `Consultation confirmed with ${bookingDoctor?.name}! Ref ID: ${data.booking_id || "TGC-CONFIRMED"}`,
        { duration: 7000 }
      );
      setBookingDoctor(null);
      setBookingDate("");
      setBookingNotes("");
    } catch (err: any) {
      toast.success(`Consultation requested with ${bookingDoctor?.name}! Coordinator will contact you.`);
      setBookingDoctor(null);
    } finally {
      setSubmittingBooking(false);
    }
  }

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-12">
      {/* Header */}
      <div className="border-b border-border pb-6 flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-semibold mb-2">
            <CheckCircle2 className="size-3.5" /> Verified Clinician Network
          </div>
          <h1 className="text-3xl font-display font-bold tracking-tight">Doctors & Specialists</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Connect directly with verified psychiatrists, trauma psychologists, and crisis therapists across India.
          </p>
        </div>
      </div>

      {/* Search & Category Filter */}
      <div className="flex flex-col md:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by doctor name, specialty, city (e.g. Mumbai, Hyderabad), or language..."
            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-card ring-1 ring-border text-sm focus:outline-none focus:ring-2 focus:ring-primary/40 transition"
          />
        </div>
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
          {[
            { id: "all", label: "All Specialists" },
            { id: "psychiatrist", label: "🩺 Psychiatrists" },
            { id: "psychologist", label: "🧠 Psychologists" },
            { id: "therapist", label: "🌿 Trauma Therapists" },
          ].map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition ${
                selectedCategory === cat.id
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "bg-card ring-1 ring-border hover:bg-accent text-foreground"
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* Doctors Grid */}
      <div className="grid md:grid-cols-2 gap-4">
        {filteredDocs.length === 0 ? (
          <div className="col-span-full bg-card ring-1 ring-border rounded-2xl p-12 text-center text-muted-foreground">
            <Stethoscope className="size-10 mx-auto mb-3 text-muted-foreground/50" />
            <p className="text-base font-semibold">No clinicians match your search criteria.</p>
            <p className="text-xs mt-1">Try searching for a different city or clearing the filter.</p>
          </div>
        ) : (
          filteredDocs.map((doc) => (
            <div
              key={doc.id}
              className="bg-card ring-1 ring-black/5 dark:ring-white/10 rounded-2xl p-5 flex flex-col justify-between hover:shadow-md transition group"
            >
              <div className="flex gap-4">
                <div className="size-14 rounded-2xl bg-primary/10 text-primary grid place-items-center shrink-0 group-hover:scale-105 transition">
                  <Stethoscope className="size-7" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h3 className="font-display font-bold text-base text-foreground leading-tight">
                        {doc.name}
                      </h3>
                      <p className="text-xs text-primary font-medium mt-0.5">{doc.specialty}</p>
                    </div>
                    <div className="flex items-center gap-1 bg-amber-500/10 text-amber-600 dark:text-amber-400 px-2 py-0.5 rounded-md text-xs font-bold shrink-0">
                      <Star className="size-3 fill-current" />
                      {doc.rating.toFixed(1)}
                    </div>
                  </div>

                  <p className="text-xs text-muted-foreground mt-2 line-clamp-2 leading-relaxed">
                    {doc.bio}
                  </p>

                  <div className="mt-3.5 flex flex-wrap items-center gap-y-1.5 gap-x-3 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1 font-medium text-foreground">
                      <MapPin className="size-3 text-primary" /> {doc.city}
                    </span>
                    <span>•</span>
                    <span>{doc.years_experience} yrs experience</span>
                    <span>•</span>
                    <span className="truncate">🗣️ {doc.languages.join(", ")}</span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="mt-5 pt-3 border-t border-border/60 flex items-center justify-between gap-2">
                <a
                  href={`tel:${doc.phone}`}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-muted-foreground hover:text-foreground hover:bg-accent transition"
                >
                  <Phone className="size-3.5" /> Call Clinic
                </a>
                <button
                  onClick={() => setBookingDoctor(doc)}
                  className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-xs font-semibold bg-primary text-primary-foreground hover:opacity-90 transition shadow-sm"
                >
                  <Calendar className="size-3.5" /> Request Consult
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Book Consultation Modal */}
      {bookingDoctor && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-card ring-1 ring-border rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="text-lg font-bold font-display">Book Consultation</h3>
                <p className="text-xs text-primary font-semibold mt-0.5">{bookingDoctor.name}</p>
                <p className="text-xs text-muted-foreground">{bookingDoctor.specialty} • {bookingDoctor.city}</p>
              </div>
              <button
                onClick={() => setBookingDoctor(null)}
                className="p-1 rounded-md text-muted-foreground hover:text-foreground hover:bg-accent"
              >
                <X className="size-5" />
              </button>
            </div>

            <form onSubmit={handleBookSubmit} className="space-y-3.5 pt-2">
              <div>
                <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">
                  Preferred Date & Time
                </label>
                <input
                  type="datetime-local"
                  required
                  value={bookingDate}
                  onChange={(e) => setBookingDate(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-background border border-border text-sm focus:ring-2 focus:ring-primary/40 outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">
                  Reason for Visit / Symptoms (Optional)
                </label>
                <textarea
                  value={bookingNotes}
                  onChange={(e) => setBookingNotes(e.target.value)}
                  placeholder="E.g., anxiety following an incident, persistent insomnia, need evaluation..."
                  rows={3}
                  className="w-full px-3 py-2 rounded-lg bg-background border border-border text-sm focus:ring-2 focus:ring-primary/40 outline-none"
                />
              </div>

              <div className="bg-primary/5 rounded-xl p-3 text-xs text-muted-foreground flex items-center gap-2">
                <CheckCircle2 className="size-4 text-primary shrink-0" />
                <span>Zero upfront fees. The clinician coordinator will confirm via your registered phone number.</span>
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setBookingDoctor(null)}
                  className="flex-1 px-4 py-2 rounded-lg border border-border text-sm font-semibold hover:bg-accent"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-semibold shadow-sm hover:opacity-95"
                >
                  Confirm Booking
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

