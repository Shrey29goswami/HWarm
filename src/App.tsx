/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Send, 
  MapPin, 
  Clock, 
  Calendar, 
  Home, 
  Coffee, 
  Bed, 
  BookOpen, 
  Moon, 
  CheckCircle2, 
  XCircle,
  Share2,
  ChevronDown,
  Eye,
  Utensils,
  Users,
  Trash2,
  ExternalLink,
  Search
} from 'lucide-react';

const HOST_NUMBER = "919876543210";
const EVENT_DATE = "10 May 2026";
const EVENT_TIME = "10:00 AM";
const MAP_URL = "https://maps.google.com/?q=YourLocation";
const EMBED_MAP_URL = "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3888.3142270054714!2d77.5844444!3d12.9711111!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zMTLCsDU4JzE2LjAiTiA3N8KwMzUnMDQuMCJF!5e0!3m2!1sen!2sin!4v1620000000000!5m2!1sen!2sin";

// --- Types ---
interface Guest {
  id: string;
  name: string;
  phone: string;
  status: 'pending' | 'accepted' | 'rejected';
  timestamp: number;
}

// --- Components ---

const RoomSection = ({ id, children, className = "", title, icon: Icon, bgImage }: any) => (
  <section 
    id={id} 
    className="h-screen w-full flex flex-col items-center justify-center snap-start relative overflow-hidden p-6"
  >
    {/* Background Image with Parallax/Zoom effect */}
    <motion.div 
      initial={{ scale: 1.1, opacity: 0 }}
      whileInView={{ scale: 1, opacity: 1 }}
      transition={{ duration: 1.5, ease: "easeOut" }}
      className="absolute inset-0 z-0"
    >
      <img 
        src={bgImage} 
        alt={title} 
        className="w-full h-full object-cover grayscale-[20%] brightness-[40%]"
        referrerPolicy="no-referrer"
      />
      <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-transparent to-black/80" />
    </motion.div>

    <motion.div
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
      className="max-w-2xl w-full text-center z-10"
    >
      {Icon && (
        <motion.div 
          initial={{ scale: 0.5, opacity: 0 }}
          whileInView={{ scale: 1, opacity: 1 }}
          className="mb-8 inline-flex p-5 rounded-[2rem] bg-white/10 backdrop-blur-xl border border-white/20 shadow-2xl"
        >
          <Icon className="w-10 h-10 text-orange-400" />
        </motion.div>
      )}
      {title && <h2 className="text-sm uppercase tracking-[0.6em] font-bold mb-6 text-orange-400 drop-shadow-lg">{title}</h2>}
      {children}
    </motion.div>
    
    <motion.div 
      animate={{ y: [0, 10, 0] }} 
      transition={{ repeat: Infinity, duration: 2.5 }}
      className="absolute bottom-10 text-white/40 z-10"
    >
      <ChevronDown size={32} strokeWidth={1} />
    </motion.div>
  </section>
);

export default function App() {
  const [guestName, setGuestName] = useState("");
  const [guestPhone, setGuestPhone] = useState("");
  const [guests, setGuests] = useState<Guest[]>([]);
  const [isAdmin, setIsAdmin] = useState(true);
  const [invitedGuest, setInvitedGuest] = useState<string | null>(null);
  const [showDoor, setShowDoor] = useState(true);
  const [doorOpened, setDoorOpened] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    const fetchGuests = async () => {
      try {
        const res = await fetch('/api/guests');
        const data = await res.json();
        setGuests(data);
      } catch (e) {
        console.error("Failed to fetch guests", e);
      }
    };

    const params = new URLSearchParams(window.location.search);
    const guest = params.get('guest');
    const isPreview = params.get('preview') === 'true';
    
    if (guest || isPreview) {
      setInvitedGuest(guest || "Our Special Guest");
      setIsAdmin(false);
    } else {
      fetchGuests();
      // Poll for updates every 5 seconds when in admin view
      const interval = setInterval(fetchGuests, 5000);
      return () => clearInterval(interval);
    }
  }, []);

  const handleSendInvite = async () => {
    if (!guestName || !guestPhone) {
      alert("Please enter guest name and phone number.");
      return;
    }

    try {
      const res = await fetch('/api/guests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: guestName, phone: guestPhone })
      });
      const newGuest = await res.json();
      setGuests([newGuest, ...guests]);
    } catch (e) {
      console.error("Failed to save guest", e);
    }

    const invitationLink = `${window.location.origin}${window.location.pathname}?guest=${encodeURIComponent(guestName)}`;
    const message = `Hi ${guestName}, you are invited to our Housewarming Ceremony 🏡✨\n📅 Date: ${EVENT_DATE}\n⏰ Time: ${EVENT_TIME}\n📍 Location: ${MAP_URL}\n\nPlease confirm here: ${invitationLink}`;
    const waLink = `https://wa.me/${guestPhone.replace(/\D/g, '')}?text=${encodeURIComponent(message)}`;
    
    setGuestName("");
    setGuestPhone("");
    window.open(waLink, '_blank');
  };

  const updateGuestStatus = async (id: string, status: 'accepted' | 'rejected' | 'pending') => {
    const updated = guests.map(g => g.id === id ? { ...g, status } : g);
    setGuests(updated);
    // Note: We'd ideally have an endpoint to update by ID too, but for simplicity we manual track in admin
  };

  const deleteGuest = async (id: string) => {
    if (confirm("Remove this guest from the list?")) {
      try {
        await fetch(`/api/guests/${id}`, { method: 'DELETE' });
        setGuests(guests.filter(g => g.id !== id));
      } catch (e) {
        console.error("Failed to delete guest", e);
      }
    }
  };

  const handleRSVP = async (status: 'accept' | 'reject') => {
    const name = invitedGuest || "Guest";
    const statusVal = status === 'accept' ? 'accepted' : 'rejected';
    
    // Automatically update the server
    try {
       await fetch('/api/rsvp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, status: statusVal })
      });
    } catch (e) {
      console.error("Failed to update status on server", e);
    }

    const message = status === 'accept' 
      ? `I will attend the housewarming 🎉 - ${name}`
      : `Sorry, I cannot attend - ${name}`;
    const waLink = `https://wa.me/${HOST_NUMBER}?text=${encodeURIComponent(message)}`;
    window.open(waLink, '_blank');
  };

  const enterHouse = () => {
    setDoorOpened(true);
    setTimeout(() => setShowDoor(false), 1200);
  };

  const filteredGuests = guests.filter(g => 
    g.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    g.phone.includes(searchTerm)
  );

  if (!isAdmin) {
    return (
      <div className="h-screen bg-[#080808] overflow-hidden">
        <AnimatePresence>
          {showDoor && (
            <motion.div 
              key="door-overlay"
              exit={{ opacity: 0, scale: 1.1 }}
              transition={{ duration: 0.8 }}
              className="fixed inset-0 z-50 flex items-center justify-center bg-[#050505]"
            >
              <div className="relative w-80 h-[500px] bg-[#1a1a1a] rounded-xl border-4 border-[#2a1d15] shadow-[0_0_100px_rgba(0,0,0,1)] flex flex-col items-center justify-center cursor-pointer group perspective-1000" onClick={enterHouse}>
                {/* Wood Texture Simulation */}
                <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/wood-pattern.png')] pointer-events-none"></div>
                
                {/* Door Frame/Panel */}
                <div className="w-[85%] h-[90%] border-2 border-white/5 rounded-lg flex flex-col items-center justify-between py-12">
                   <div className="text-center">
                    <div className="text-6xl font-serif text-orange-400/20 mb-2 group-hover:text-orange-400/40 transition-colors">202</div>
                    <div className="h-px w-12 bg-orange-400/10 mx-auto"></div>
                  </div>

                  <motion.div 
                    whileHover={{ scale: 1.1 }}
                    className="w-12 h-12 bg-[#c5a059] rounded-full shadow-[inset_0_2px_4px_rgba(0,0,0,0.5),0_10px_20px_rgba(0,0,0,0.4)] relative"
                  >
                    <div className="absolute right-2 top-1/2 -translate-y-1/2 w-3 h-3 bg-black/20 rounded-full"></div>
                  </motion.div>

                  <div className="text-white/30 text-xs tracking-[0.3em] uppercase">Tap to Enter</div>
                </div>

                {/* Opening Animation Door */}
                <motion.div 
                  initial={false}
                  animate={doorOpened ? { rotateY: -110 } : { rotateY: 0 }}
                  transition={{ duration: 1.2, ease: [0.45, 0, 0.55, 1] }}
                  style={{ transformOrigin: 'left' }}
                  className="absolute inset-0 bg-[#2a1d15] rounded-sm shadow-2xl z-20 border-r border-black/50"
                >
                   <div className="absolute inset-0 opacity-15 bg-[url('https://www.transparenttextures.com/patterns/wood-pattern.png')]"></div>
                   
                   {/* Decorative Panel on Door */}
                   <div className="absolute inset-4 border border-white/5 rounded-sm flex items-center justify-center">
                      <div className="text-5xl font-serif text-[#1a110a] drop-shadow-lg">202</div>
                   </div>

                   {/* Door Handle */}
                   <div className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-[#c5a059] rounded-full shadow-lg flex items-center justify-center">
                      <div className="w-2 h-2 bg-black/30 rounded-full"></div>
                   </div>
                </motion.div>
                
                {/* Visual Light Spill Background */}
                <div className="absolute inset-0 bg-orange-100 opacity-0 group-hover:opacity-5 transition-opacity duration-1000 z-10" />
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <main className="h-screen overflow-y-auto snap-y snap-mandatory scroll-smooth font-sans selection:bg-orange-500/30">
          {/* Hall (Living Room) */}
          <RoomSection 
            id="hall" 
            title="The Grand Hall" 
            icon={Home} 
            bgImage="https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?auto=format&fit=crop&q=80&w=1600"
          >
            <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} transition={{ delay: 0.5 }}>
              <h1 className="text-5xl md:text-8xl font-serif text-white mb-8 leading-tight tracking-tight drop-shadow-2xl">
                Our Nest, <br />
                <span className="italic text-transparent bg-clip-text bg-gradient-to-r from-orange-200 via-orange-400 to-orange-200">Your Presence</span>
              </h1>
              <p className="text-xl md:text-2xl text-white/80 max-w-lg mx-auto leading-relaxed font-light drop-shadow-lg">
                Hi {invitedGuest}, we've finally turned our dream into reality. Come celebrate with us.
              </p>
            </motion.div>
          </RoomSection>

          {/* Kitchen (Dining Area) */}
          <RoomSection 
            id="kitchen" 
            title="Dining Area" 
            icon={Utensils} 
            bgImage="https://images.unsplash.com/photo-1556910103-1c02745aae4d?auto=format&fit=crop&q=80&w=1600"
          >
            <div className="relative">
              <h2 className="text-4xl md:text-6xl font-serif text-white mb-10 italic drop-shadow-xl">A Toast to New Beginnings</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-left relative z-10 max-w-xl mx-auto">
                <div className="p-6 bg-black/40 backdrop-blur-2xl rounded-[2.5rem] border border-white/10 flex items-center gap-5 shadow-2xl">
                  <div className="p-3 bg-orange-500/20 rounded-2xl">
                    <Calendar className="text-orange-400" size={28} />
                  </div>
                  <div>
                    <div className="text-[10px] text-white/50 uppercase tracking-[0.2em] font-black">Date</div>
                    <div className="text-white text-2xl font-serif">{EVENT_DATE}</div>
                  </div>
                </div>
                <div className="p-6 bg-black/40 backdrop-blur-2xl rounded-[2.5rem] border border-white/10 flex items-center gap-5 shadow-2xl">
                  <div className="p-3 bg-orange-500/20 rounded-2xl">
                    <Clock className="text-orange-400" size={28} />
                  </div>
                  <div>
                    <div className="text-[10px] text-white/50 uppercase tracking-[0.2em] font-black">Time</div>
                    <div className="text-white text-2xl font-serif">{EVENT_TIME}</div>
                  </div>
                </div>
              </div>
              <p className="mt-12 text-white/70 max-w-md mx-auto italic font-serif text-xl border-t border-white/10 pt-8">
                Join us for blessings and authentic housewarming treats.
              </p>
            </div>
          </RoomSection>

          {/* Bedroom */}
          <RoomSection 
            id="bedroom" 
            title="Personal Space" 
            icon={Bed} 
            bgImage="https://images.unsplash.com/photo-1505693355201-4966687c4f4d?auto=format&fit=crop&q=80&w=1600"
          >
            <h2 className="text-4xl md:text-6xl font-serif text-white mb-8 drop-shadow-xl">Comfort & Dreams</h2>
            <div className="p-10 md:p-16 bg-black/40 backdrop-blur-md rounded-[3rem] border border-white/10 relative overflow-hidden group shadow-[0_50px_100px_-20px_rgba(0,0,0,0.5)]">
              <span className="absolute -top-6 -left-6 text-9xl text-white/5 font-serif select-none italic">{"\""}</span>
              <p className="text-2xl md:text-4xl text-white/90 italic leading-[1.5] relative z-10 font-serif font-light">
                A home is made of walls and beams, but a home is built with your love and blessings.
              </p>
              <span className="absolute -bottom-16 -right-6 text-9xl text-white/5 font-serif select-none italic">{"\""}</span>
            </div>
          </RoomSection>

          {/* Study (RSVP) */}
          <RoomSection 
            id="study" 
            title="The Study" 
            icon={BookOpen} 
            bgImage="https://images.unsplash.com/photo-1497366754035-f200968a6e72?auto=format&fit=crop&q=80&w=1600"
          >
            <h2 className="text-4xl md:text-6xl font-serif text-white mb-12 tracking-tight drop-shadow-xl">Join the Chapter?</h2>
            <div className="flex flex-col sm:flex-row gap-6 w-full max-w-lg mx-auto">
              <motion.button
                whileHover={{ scale: 1.05, y: -4 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => handleRSVP('accept')}
                className="flex-[1.5] bg-gradient-to-br from-orange-400 to-orange-600 text-white py-7 rounded-[2rem] font-bold text-2xl shadow-2xl shadow-orange-500/40 flex items-center justify-center gap-3"
              >
                <CheckCircle2 size={30} />
                Confirm Presence
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => handleRSVP('reject')}
                className="flex-1 bg-black/40 backdrop-blur-xl text-white/60 hover:text-white hover:bg-white/10 border border-white/10 py-7 rounded-[2rem] font-medium text-xl transition-all flex items-center justify-center gap-3"
              >
                <XCircle size={24} />
                Regretfully
              </motion.button>
            </div>
          </RoomSection>

          {/* Balcony (Map) */}
          <RoomSection 
            id="balcony" 
            title="The Balcony View" 
            icon={Moon} 
            bgImage="https://images.unsplash.com/photo-1533090161767-e6ffed986c88?auto=format&fit=crop&q=80&w=1600"
          >
            <h2 className="text-4xl md:text-6xl font-serif text-white mb-10 tracking-tighter italic drop-shadow-xl">Open Horizon</h2>
            <div className="w-full h-80 md:h-[450px] rounded-[4rem] overflow-hidden border border-white/10 mb-10 bg-black/60 relative group shadow-2xl">
               <iframe 
                src={EMBED_MAP_URL}
                width="100%" 
                height="100%" 
                style={{ border: 0 }} 
                allowFullScreen={true}
                className="grayscale opacity-50 contrast-125 group-hover:grayscale-0 group-hover:opacity-100 transition-all duration-1000"
                loading="lazy" 
                referrerPolicy="no-referrer-when-downgrade"
              />
              <div className="absolute inset-0 pointer-events-none border-[20px] border-black/0 group-hover:border-black/5 transition-all duration-700" />
            </div>
            <motion.a 
              whileHover={{ scale: 1.05, backgroundColor: "rgba(249, 115, 22, 0.2)" }}
              href={MAP_URL} 
              target="_blank" 
              rel="noopener noreferrer"
              className="inline-flex items-center gap-4 bg-white/10 backdrop-blur-xl border border-white/20 px-10 py-5 rounded-full text-orange-400 font-bold text-xl hover:text-white transition-all shadow-2xl"
            >
              <MapPin size={24} />
              Open GPS Navigation
            </motion.a>
          </RoomSection>
        </main>
      </div>
    );
  }

  // --- Admin UI ---
  return (
    <div className="min-h-screen bg-[#050505] text-white flex flex-col md:flex-row p-4 md:p-10 gap-8 selection:bg-orange-500/30 overflow-x-hidden">
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-orange-500/5 blur-[150px] rounded-full -translate-y-1/2 translate-x-1/2 pointer-events-none"></div>
      
      {/* Left Column: Form */}
      <div className="w-full md:w-[400px] shrink-0">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center md:text-left mb-10">
          <div className="inline-flex p-6 rounded-[2.5rem] bg-orange-500/10 border border-orange-500/20 mb-8 shadow-2xl">
            <Home className="w-12 h-12 text-orange-400" />
          </div>
          <h1 className="text-4xl font-serif font-semibold mb-4 tracking-tight">Host Dashboard</h1>
          <p className="text-white/40 text-lg">Manage your guest list and send invitations.</p>
        </motion.div>

        <motion.div initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.1 }} className="bg-white/[0.03] backdrop-blur-2xl p-8 rounded-[3rem] border border-white/10 shadow-2xl sticky top-10">
          <div className="space-y-6">
            <div className="space-y-3">
              <label className="text-[10px] uppercase tracking-[0.3em] text-orange-400 font-black ml-1">Guest Designation</label>
              <input 
                type="text" 
                placeholder="Name (e.g. Rahul & Family)"
                value={guestName}
                onChange={(e) => setGuestName(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 px-6 text-white focus:outline-none focus:ring-4 focus:ring-orange-500/20 transition-all placeholder:text-white/10 text-lg font-light"
              />
            </div>
            
            <div className="space-y-3">
              <label className="text-[10px] uppercase tracking-[0.3em] text-orange-400 font-black ml-1">WhatsApp Number</label>
              <input 
                type="tel" 
                placeholder="919876543210"
                value={guestPhone}
                onChange={(e) => setGuestPhone(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 px-6 text-white focus:outline-none focus:ring-4 focus:ring-orange-500/20 transition-all placeholder:text-white/10 text-lg font-light"
              />
            </div>

            <div className="grid grid-cols-1 gap-4 pt-2">
              <motion.button whileHover={{ scale: 1.02, y: -2 }} whileTap={{ scale: 0.98 }} onClick={handleSendInvite} className="w-full bg-gradient-to-br from-orange-400 to-orange-600 text-white font-bold py-5 rounded-[1.5rem] shadow-xl shadow-orange-500/20 flex items-center justify-center gap-3 transition-all">
                <Send size={20} />
                Send Invitation
              </motion.button>
              
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => {
                  const url = new URL(window.location.href);
                  url.searchParams.set('preview', 'true');
                  window.open(url.toString(), '_blank');
                }}
                className="w-full bg-white/5 border border-white/10 text-white/40 hover:text-white hover:bg-white/10 py-4 rounded-[1.5rem] font-medium transition-all flex items-center justify-center gap-2"
              >
                <Eye size={18} />
                Live Preview Tour
              </motion.button>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Right Column: Guest List */}
      <div className="flex-1 min-w-0">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div className="flex items-center gap-3">
            <Users className="text-orange-400" size={28} />
            <h2 className="text-3xl font-serif">Guest Tracker</h2>
            <span className="bg-orange-500/10 text-orange-400 px-3 py-1 rounded-full text-sm font-bold border border-orange-500/20">
              {guests.length}
            </span>
          </div>
          
          <div className="relative group flex-1 max-w-xs">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20 group-focus-within:text-orange-400 transition-colors" size={18} />
            <input 
              type="text" 
              placeholder="Search guests..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-full py-3 pl-12 pr-6 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/30 transition-all font-light"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
          <AnimatePresence mode="popLayout">
            {filteredGuests.length > 0 ? (
              filteredGuests.map((guest) => (
                <motion.div 
                  key={guest.id}
                  layout 
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  className="bg-white/[0.02] border border-white/5 rounded-3xl p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 hover:bg-white/[0.04] transition-colors group"
                >
                  <div className="flex items-center gap-5">
                    <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shadow-inner ${
                      guest.status === 'accepted' ? 'bg-green-500/10' : 
                      guest.status === 'rejected' ? 'bg-red-500/10' : 'bg-orange-500/10'
                    }`}>
                      {guest.status === 'accepted' ? <CheckCircle2 className="text-green-400" /> : 
                       guest.status === 'rejected' ? <XCircle className="text-red-400" /> : <Clock className="text-orange-400" />}
                    </div>
                    <div>
                      <h3 className="text-xl font-medium text-white/90 group-hover:text-white transition-colors">{guest.name}</h3>
                      <div className="flex items-center gap-3 mt-1">
                        <span className="text-xs text-white/30 font-mono tracking-tighter">{guest.phone}</span>
                        <div className="w-1 h-1 bg-white/10 rounded-full" />
                        <span className="text-[10px] text-white/20 uppercase tracking-widest">{new Date(guest.timestamp).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 w-full sm:w-auto">
                    <select 
                      value={guest.status}
                      onChange={(e) => updateGuestStatus(guest.id, e.target.value as any)}
                      className="bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-xs text-white/60 focus:outline-none hover:bg-white/10 transition-colors"
                    >
                      <option value="pending">Pending</option>
                      <option value="accepted">Accepted</option>
                      <option value="rejected">Rejected</option>
                    </select>
                    
                    <button 
                      onClick={() => window.open(`https://wa.me/${guest.phone.replace(/\D/g, '')}`, '_blank')}
                      className="p-2.5 bg-white/5 rounded-xl text-white/40 hover:text-orange-400 hover:bg-orange-500/10 transition-all"
                      title="Open Chat"
                    >
                      <Share2 size={18} />
                    </button>

                    <button 
                      onClick={() => deleteGuest(guest.id)}
                      className="p-2.5 bg-white/5 rounded-xl text-white/20 hover:text-red-400 hover:bg-red-500/10 transition-all"
                      title="Delete"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </motion.div>
              ))
            ) : (
              <div className="col-span-full py-20 text-center bg-white/[0.01] border border-dashed border-white/5 rounded-[3rem]">
                <Users className="mx-auto text-white/5 mb-4" size={48} />
                <p className="text-white/20 font-serif italic text-xl">No guests found. Start by sending an invitation.</p>
              </div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
