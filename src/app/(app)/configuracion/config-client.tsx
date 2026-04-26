"use client";
import { useState } from "react";
import { User, Stethoscope, Clock, MapPin, Plug } from "lucide-react";
import { ProfileTab } from "./tabs/profile-tab";
import { ServicesTab } from "./tabs/services-tab";
import { ScheduleTab } from "./tabs/schedule-tab";
import { LocationsTab } from "./tabs/locations-tab";
import { IntegrationsTab } from "./tabs/integrations-tab";

export interface DentistData {
  id: string;
  fullName: string;
  email: string;
  rut: string | null;
  licenseNumber: string | null;
  specialty: string | null;
  phone: string | null;
  bio: string | null;
  photoUrl: string | null;
  slug: string | null;
  isPublished: boolean;
  verificationStatus: string;
  plan: string;
}

export interface PublicProfileData {
  bioPublic: string;
  experience: string;
  languages: string[];
  paymentMethods: string[];
  insuranceProviders: string[];
  education: string[];
  acceptsInsurance: boolean;
  emergencyCare: boolean;
  facebookUrl?: string;
  instagramUrl?: string;
}

export interface ServiceData {
  id: string;
  name: string;
  description: string | null;
  durationMin: number;
  priceCLP: number | null;
  active: boolean;
  order: number;
}

export interface ScheduleBlock {
  id?: string;
  dayOfWeek: number;
  openTime: string;
  closeTime: string;
  slotMinutes: number;
  enabled: boolean;
}

export interface LocationData {
  id: string;
  name: string;
  address: string | null;
  commune: string | null;
  city: string | null;
  region: string | null;
  phone: string | null;
}

type Tab = "profile" | "services" | "schedule" | "locations" | "integrations";

const TABS: { id: Tab; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
  { id: "profile", label: "Perfil", icon: User },
  { id: "services", label: "Servicios", icon: Stethoscope },
  { id: "schedule", label: "Horarios", icon: Clock },
  { id: "locations", label: "Sedes", icon: MapPin },
  { id: "integrations", label: "Integraciones", icon: Plug },
];

export function ConfigClient(props: {
  dentist: DentistData;
  publicProfile: PublicProfileData;
  services: ServiceData[];
  schedule: ScheduleBlock[];
  locations: LocationData[];
  whatsappConfigured: boolean;
  verifyToken: string;
}) {
  const [tab, setTab] = useState<Tab>("profile");

  return (
    <div className="grid md:grid-cols-[220px_1fr] gap-6">
      {/* Sidebar tabs */}
      <nav className="md:sticky md:top-6 md:self-start">
        <ul className="flex md:flex-col gap-1 overflow-x-auto md:overflow-visible pb-1 md:pb-0">
          {TABS.map((t) => {
            const Icon = t.icon;
            const active = tab === t.id;
            return (
              <li key={t.id} className="flex-shrink-0">
                <button
                  type="button"
                  onClick={() => setTab(t.id)}
                  className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition whitespace-nowrap ${
                    active
                      ? "bg-blue-50 text-blue-700 border border-blue-200"
                      : "text-slate-600 hover:bg-slate-100 border border-transparent"
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {t.label}
                </button>
              </li>
            );
          })}
        </ul>
      </nav>

      <div className="min-w-0">
        {tab === "profile" && (
          <ProfileTab dentist={props.dentist} publicProfile={props.publicProfile} />
        )}
        {tab === "services" && <ServicesTab initial={props.services} />}
        {tab === "schedule" && <ScheduleTab initial={props.schedule} />}
        {tab === "locations" && <LocationsTab initial={props.locations} />}
        {tab === "integrations" && (
          <IntegrationsTab
            whatsappConfigured={props.whatsappConfigured}
            verifyToken={props.verifyToken}
          />
        )}
      </div>
    </div>
  );
}
