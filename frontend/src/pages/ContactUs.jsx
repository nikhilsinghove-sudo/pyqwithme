import { useEffect, useState } from "react";
import { Helmet } from "react-helmet-async";
import { Mail, MapPin } from "lucide-react";
import { api } from "../api/axiosClient.js";

export function ContactUs() {
  const [email, setEmail] = useState("");
  const [location, setLocation] = useState("");

  useEffect(() => {
    api.get("/settings")
      .then(({ data }) => {
        setEmail(data.settings?.contactEmail || "support@pyqwithme.com");
        setLocation(data.settings?.contactLocation || "New Delhi, India");
      })
      .catch(() => {
        setEmail("support@pyqwithme.com");
        setLocation("New Delhi, India");
      });
  }, []);

  return (
    <section className="container-page py-12 max-w-2xl">
      <Helmet><title>Contact Us | PYQwithMe</title></Helmet>
      <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-soft dark:border-slate-800 dark:bg-slate-900">
        <div className="border-b border-slate-100 pb-5 dark:border-slate-800 text-center">
          <h1 className="text-3xl font-bold tracking-tight">Contact Us</h1>
          <p className="text-sm text-slate-500 mt-1.5">Get in touch with the PYQwithMe moderation team</p>
        </div>
        
        <div className="mt-8 space-y-6">
          {/* Email Card */}
          <div className="flex items-center gap-4 p-4 rounded-xl border border-slate-100 bg-slate-50/50 dark:border-slate-800 dark:bg-slate-950/20 transition-all hover:shadow-soft">
            <div className="rounded-lg bg-brand-50 p-3 text-brand-600 dark:bg-slate-800/80">
              <Mail className="h-6 w-6" />
            </div>
            <div>
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Email Address</p>
              <a href={`mailto:${email}`} className="text-lg font-bold text-slate-800 hover:text-brand-600 dark:text-slate-100 dark:hover:text-brand-400 transition-colors">
                {email || "support@pyqwithme.com"}
              </a>
            </div>
          </div>

          {/* Location Card */}
          <div className="flex items-center gap-4 p-4 rounded-xl border border-slate-100 bg-slate-50/50 dark:border-slate-800 dark:bg-slate-950/20 transition-all hover:shadow-soft">
            <div className="rounded-lg bg-brand-50 p-3 text-brand-600 dark:bg-slate-800/80">
              <MapPin className="h-6 w-6" />
            </div>
            <div>
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Our Location</p>
              <p className="text-lg font-bold text-slate-800 dark:text-slate-100">
                {location || "New Delhi, India"}
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
export default ContactUs;
