"use client";

import React, { useState, useEffect } from "react";
import { createClient } from '@/utils/supabase'; 

export default function PortfolioTailwind() {
  const [profile, setProfile] = useState<any>(null);
  const [skills, setSkills] = useState<any[]>([]);
  const [educations, setEducations] = useState<any[]>([]);
  const [experiences, setExperiences] = useState<any[]>([]);
  const [services, setServices] = useState<any[]>([]);
  const [projects, setProjects] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const [activeSection, setActiveSection] = useState("home");
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [modalData, setModalData] = useState<any>(null);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [isHovering, setIsHovering] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      const supabase = createClient();

      try {
        const [
          { data: profileData },
          { data: skillsData },
          { data: educationsData },
          { data: experiencesData },
          { data: servicesData },
          { data: projectsData }
        ] = await Promise.all([
          supabase.from('profiles').select('*').single(), // Mengambil 1 baris profile
          supabase.from('skills').select('*').order('sort_order', { ascending: true }),
          supabase.from('education').select('*').order('sort_order', { ascending: true }),
          supabase.from('experiences').select('*').order('sort_order', { ascending: true }),
          supabase.from('services').select('*').order('sort_order', { ascending: true }),
          supabase.from('projects').select('*').order('sort_order', { ascending: true })
        ]);

        setProfile(profileData);
        setSkills(skillsData || []);
        setEducations(educationsData || []);
        setExperiences(experiencesData || []);
        setServices(servicesData || []);
        setProjects(projectsData || []);
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  useEffect(() => {
    if (isLoading) return;
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) setActiveSection(entry.target.id);
        });
      },
      { threshold: 0.3 }
    );

    const sections = document.querySelectorAll("section");
    sections.forEach((section) => observer.observe(section));
    return () => sections.forEach((section) => observer.unobserve(section));
  }, [isLoading]);

  useEffect(() => {
    const savedTheme = localStorage.getItem("theme");
    if (savedTheme === "dark") {
      setIsDarkMode(true);
      document.documentElement.classList.add("dark");
    }
  }, []);

  const toggleDarkMode = (e: any) => {
    const isChecked = e.target.checked;
    setIsDarkMode(isChecked);
    if (isChecked) {
      document.documentElement.classList.add("dark");
      localStorage.setItem("theme", "dark");
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("theme", "light");
    }
  };

  useEffect(() => {
    const handleMouseMove = (e: any) => setMousePos({ x: e.clientX, y: e.clientY });
    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  useEffect(() => {
    if (modalData) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'auto';
    }
  }, [modalData]);

  const getImageUrl = (path: string) => {
    if (!path) return '';
    if (path.startsWith('http')) return path; // Jika sudah URL penuh
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    return `${supabaseUrl}/storage/v1/object/public/portfolio-bucket/${path}`;
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-white dark:bg-[#111319] flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#D6002F]"></div>
      </div>
    );
  }

  if (!profile) return <div>Failed to load data.</div>;

  const textDark = "text-[#0F172A] dark:text-white";
  const textMuted = "text-[#7E7E7E] dark:text-[#A9AFC3]";
  const bgLight = "bg-white dark:bg-[#111319]";
  const bgAlt = "bg-[#F9F9FC] dark:bg-[#191C26]";
  const primaryColor = "text-[#D6002F]";
  
  return (
    <div className={`min-h-screen ${bgLight} ${textMuted} font-sans selection:bg-[#D6002F] selection:text-white transition-colors duration-300`}>
      
      {/* CUSTOM CURSOR */}
      <div 
        className={`fixed top-0 left-0 pointer-events-none z-[9999] rounded-full transform -translate-x-1/2 -translate-y-1/2 transition-all duration-100 ${isHovering ? 'w-20 h-20 bg-[#D6002F]/30 border-none' : 'w-8 h-8 border-2 border-[#D6002F]'}`}
        style={{ left: `${mousePos.x}px`, top: `${mousePos.y}px` }}
      />
      <div 
        className="fixed top-0 left-0 w-2 h-2 bg-[#D6002F] rounded-full pointer-events-none z-[10000] transform -translate-x-1/2 -translate-y-1/2"
        style={{ left: `${mousePos.x}px`, top: `${mousePos.y}px` }}
      />

      {/* TOPBAR */}
      <header className={`fixed top-0 left-0 right-0 z-50 ${bgLight} shadow-sm transition-all duration-300`}>
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="text-2xl font-bold tracking-tighter">
            {/* Logic ternary untuk mengganti logo berdasarkan isDarkMode */}
            <img 
              src={isDarkMode ? "/img/logo/rianfpm-logo-putih.png" : "/img/logo/rianfpm-logo-hitam.png"} 
              alt="Logo RianFPM" 
              className="h-15 w-auto transition-opacity duration-300" 
            />
          </div>
          
          <nav className="hidden md:flex items-center gap-8">
            {["home", "about", "services", "portfolio", "contact"].map((sec) => (
              <a 
                key={sec} 
                href={`#${sec}`} 
                onMouseEnter={() => setIsHovering(true)}
                onMouseLeave={() => setIsHovering(false)}
                className={`text-base font-medium capitalize transition-colors ${
                  activeSection === sec ? primaryColor : `${textMuted} hover:${primaryColor}`
                }`}
              >
                {sec}
              </a>
            ))}
            
            {/* Theme Toggle Switch */}
            <div className="flex items-center ml-4">
              <label className="relative inline-flex items-center cursor-pointer" onMouseEnter={() => setIsHovering(true)} onMouseLeave={() => setIsHovering(false)}>
                <input type="checkbox" className="sr-only peer" checked={isDarkMode} onChange={toggleDarkMode} />
                <div className="w-14 h-7 bg-[#8bb6d1] peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full after:content-['☀️'] peer-checked:after:content-['🌙'] after:absolute after:top-[2px] after:left-[4px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-[#191C26] after:flex after:items-center after:justify-center after:text-xs peer-checked:after:bg-[#D6002F] peer-checked:after:text-white peer-checked:after:border-none"></div>
              </label>
            </div>
          </nav>

          <button className="md:hidden text-2xl" onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
            ☰
          </button>
        </div>
      </header>

      {/* MOBILE MENU DROPDOWN */}
      {isMobileMenuOpen && (
        <div className={`fixed top-[68px] left-0 w-full ${bgAlt} shadow-lg z-40 md:hidden`}>
          <ul className="flex flex-col px-6 py-4 gap-4">
             {["home", "about", "services", "portfolio", "contact"].map((sec) => (
              <li key={sec}>
                <a href={`#${sec}`} onClick={() => setIsMobileMenuOpen(false)} className={`capitalize font-medium ${textDark}`}>
                  {sec}
                </a>
              </li>
            ))}
            <li className="pt-4 border-t border-gray-200 dark:border-gray-700">
               <label className="flex items-center gap-4 cursor-pointer">
                <span className={textDark}>Dark Mode</span>
                <input type="checkbox" className="sr-only peer" checked={isDarkMode} onChange={toggleDarkMode} />
                <div className="w-12 h-6 bg-[#8bb6d1] rounded-full peer peer-checked:after:translate-x-full after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-gray-800 relative"></div>
              </label>
            </li>
          </ul>
        </div>
      )}

      {/* HERO SECTION */}
      <section id="home" className={`${bgAlt} min-h-screen flex items-center pt-20`}>
        <div className="max-w-7xl mx-auto px-6 w-full flex flex-col md:flex-row items-center gap-12">
          <div className="w-full md:w-3/5">
            <h3 className={`text-2xl font-medium ${textDark} mb-4`}>{profile.hero_title}</h3>
            <h1 className={`text-5xl md:text-7xl font-bold ${textDark} leading-tight mb-4`}>
              {profile.name}
            </h1>
            <h2 className="text-3xl md:text-5xl font-bold mb-6">
              <span className={textDark}>{profile.hero_job_title}</span> <br/>
              <span className={primaryColor}>{profile.hero_based_title}</span>
            </h2>
            <p className="text-lg md:text-xl max-w-lg mb-10">
              {profile.hero_subtitle}
            </p>
            <a 
              href="#about" 
              onMouseEnter={() => setIsHovering(true)}
              onMouseLeave={() => setIsHovering(false)}
              className={`inline-block px-10 py-4 border-2 border-[#7E7E7E] dark:border-[#A9AFC3] rounded-md font-medium ${textDark} hover:border-[#D6002F] hover:text-[#D6002F] dark:hover:border-[#D6002F] dark:hover:text-[#D6002F] transition-all`}
            >
              About Me
            </a>
          </div>
        </div>
      </section>

      {/* ABOUT SECTION */}
      <section id="about" className={`py-24 ${bgLight}`}>
        <div className="max-w-7xl mx-auto px-6">
          <div className="mb-16">
            <span className={`${primaryColor} font-medium flex items-center gap-4`}>
              About Me <span className="w-10 h-[1px] bg-[#D6002F]"></span>
            </span>
            <h2 className={`text-5xl font-bold ${textDark} mt-4 mb-6`}>Biography</h2>
            <p className="max-w-2xl text-lg">{profile.about_short_description}</p>
          </div>

          <div className="flex flex-col md:flex-row gap-16">
            <div className="w-full md:w-5/12 h-[500px] bg-gray-200 dark:bg-gray-800 rounded-xl overflow-hidden relative">
               <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: `url('${getImageUrl(profile.about_image) || '/assets/img/about/1.jpg'}')` }}></div>
            </div>
            
            <div className="w-full md:w-7/12">
              <div className="border-b border-gray-200 dark:border-gray-800 pb-8 mb-8">
                <h3 className={`text-3xl font-bold ${textDark} mb-6`}>{profile.about_greeting}</h3>
                <p className="text-lg leading-relaxed">{profile.about_description}</p>
              </div>

              <div>
                <h3 className={`text-2xl font-bold ${textDark} uppercase mb-6`}>Personal Info</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-y-4 gap-x-8 mb-10">
                  <p><span className="text-gray-400">Name :</span> <span className={`font-medium ${textDark}`}>{profile.name}</span></p>
                  <p><span className="text-gray-400">Email :</span> <span className={`font-medium ${textDark}`}>{profile.email}</span></p>
                  <p><span className="text-gray-400">Phone :</span> <span className={`font-medium ${textDark}`}>{profile.phone}</span></p>
                  <p><span className="text-gray-400">University :</span> <span className={`font-medium ${textDark}`}>{profile.university}</span></p>
                  <p><span className="text-gray-400">Degree :</span> <span className={`font-medium ${textDark}`}>{profile.degree}</span></p>
                  <p><span className="text-gray-400">GPA :</span> <span className={`font-medium ${textDark}`}>{profile.gpa}</span></p>
                  <p><span className="text-gray-400">Freelance :</span> <span className={`font-medium ${textDark}`}>{profile.freelance_status}</span></p>
                  <p><span className="text-gray-400">Linkedin :</span> <a className={`font-medium ${textDark}`} target="_blank" href={profile.linkedin_url}>{profile.linkedin_url}</a></p>
                </div>
                
                <a 
                  href={getImageUrl(profile.cv_file) || "#"} 
                  target="_blank"
                  onMouseEnter={() => setIsHovering(true)}
                  onMouseLeave={() => setIsHovering(false)}
                  className="inline-block px-10 py-4 bg-[#D6002F] text-white rounded-md font-medium hover:bg-red-700 transition-colors"
                >
                  Download CV
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* RESUME / SKILLS SECTION */}
      <section className={`py-24 ${bgAlt}`}>
        <div className="max-w-7xl mx-auto px-6">
          <h2 className={`text-4xl font-bold text-center ${textDark} mb-20`}>Skills & Education</h2>
          
          <div className="flex flex-col md:flex-row gap-20">
            {/* Skills */}
            <div className="w-full md:w-1/2">
              <h3 className={`text-2xl font-bold ${textDark} uppercase mb-10 flex items-center gap-4`}>
                <span className="w-8 h-[2px] bg-gray-400"></span> Hard Skills
              </h3>
              <div className="space-y-8">
                {skills.map((skill, idx) => (
                  <div key={idx}>
                    <div className="flex justify-between mb-2">
                      <span className={`font-medium ${textDark}`}>{skill.name}</span>
                      <span className={textMuted}>{skill.percentage}%</span>
                    </div>
                    <div className="w-full bg-gray-200 dark:bg-gray-800 h-2 rounded-full overflow-hidden">
                      <div className="bg-[#D6002F] h-full rounded-full transition-all duration-1000" style={{ width: `${skill.percentage}%` }}></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Education */}
            <div className="w-full md:w-1/2">
              <h3 className={`text-2xl font-bold ${textDark} uppercase mb-10 flex items-center gap-4`}>
                <span className="w-8 h-[2px] bg-gray-400"></span> Education
              </h3>
              <div className="space-y-8 relative before:absolute before:inset-y-0 before:left-0 before:w-[2px] before:bg-gray-300 dark:before:bg-gray-700">
                {educations.map((edu, idx) => (
                  <div key={idx} className="relative pl-8">
                    <span className="absolute left-[-5px] top-2 w-3 h-3 rounded-full border-2 border-gray-400 bg-white dark:bg-gray-900"></span>
                    <h4 className={`text-xl font-bold ${textDark}`}>{edu.institution}</h4>
                    <p className="mt-1">{edu.degree}</p>
                    <span className="inline-block mt-2 px-3 py-1 bg-gray-200 dark:bg-gray-800 text-sm rounded">{edu.start_period} - {edu.end_period}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* EXPERIENCE TIMELINE */}
      {experiences.length > 0 && (
        <section className={`py-24 ${bgLight}`}>
          <div className="max-w-5xl mx-auto px-6">
            <h2 className={`text-4xl font-bold text-center ${textDark} mb-20`}>Work Experience</h2>
            
            <div className="relative border-l-2 md:border-l-0 md:border-t-0 border-gray-200 dark:border-gray-800 md:before:absolute md:before:inset-y-0 md:before:left-1/2 md:before:-ml-[1px] md:before:w-[2px] md:before:bg-gray-200 md:dark:before:bg-gray-800 ml-4 md:ml-0">
              {experiences.map((exp, idx) => {
                const isRight = idx % 2 !== 0;
                return (
                  <div key={idx} className={`relative mb-12 md:w-1/2 ${isRight ? 'md:ml-auto md:pl-12 pl-8' : 'md:pr-12 md:text-right pl-8'}`}>
                    <div className={`absolute top-6 w-4 h-4 bg-[#D6002F] rounded-full border-4 border-white dark:border-[#111319] shadow z-10 
                      left-[-9px] md:left-auto ${isRight ? 'md:-left-[9px]' : 'md:-right-[9px]'}`}>
                    </div>
                    
                    <div 
                      onClick={() => setModalData({
                        title: exp.company,
                        content: exp.full_description,
                        image: exp.image // Data image aslinya path
                      })}
                      onMouseEnter={() => setIsHovering(true)}
                      onMouseLeave={() => setIsHovering(false)}
                      className={`p-8 rounded-xl ${bgAlt} shadow-sm hover:shadow-md transition-all cursor-pointer relative group
                       before:absolute before:top-6 before:w-4 before:h-4 before:rotate-45 before:${bgAlt} 
                       left-0 md:left-auto ${isRight ? 'before:-left-2 md:before:-left-2' : 'before:-left-2 md:before:auto md:before:-right-2'}
                    `}>
                      <span className="inline-block bg-[#D6002F] text-white px-3 py-1 text-xs font-bold rounded mb-4">
                        {exp.start_period} - {exp.end_period}
                      </span>
                      <h3 className={`text-xl font-bold ${textDark} mb-1 group-hover:text-[#D6002F] transition-colors`}>{exp.company}</h3>
                      <p className={`italic ${textMuted} mb-4`}>{exp.role}</p>
                      <p className="leading-relaxed mb-4">{exp.short_description}</p>
                      <button className={`font-semibold ${textDark} group-hover:text-[#D6002F] transition-colors`}>
                        More Detail ➔
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>
      )}

      {/* SERVICES SECTION */}
      {services.length > 0 && (
        <section id="services" className={`py-24 ${bgAlt}`}>
          <div className="max-w-7xl mx-auto px-6">
            <div className="mb-16">
              <span className={`${primaryColor} font-medium flex items-center gap-4`}>
                Services <span className="w-10 h-[1px] bg-[#D6002F]"></span>
              </span>
              <h2 className={`text-4xl font-bold ${textDark} mt-4`}>I provide wide range of digital services</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {services.map((srv, idx) => (
                <div 
                  key={idx} 
                  onClick={() => setModalData({
                    title: srv.title,
                    content: srv.popup_description, // Merujuk pada kolom di Supabase/SQL
                    image: srv.popup_image
                  })}
                  onMouseEnter={() => setIsHovering(true)}
                  onMouseLeave={() => setIsHovering(false)}
                  className={`p-10 rounded-xl ${bgLight} shadow-sm hover:-translate-y-2 transition-transform duration-300 cursor-pointer group`}
                >
                  <div className="w-12 h-12 mb-6 text-[#D6002F] group-hover:scale-110 transition-transform flex items-center justify-center">
                    {/* Menggunakan image/icon asli jika ada */}
                    {srv.icon ? (
                      <img src={getImageUrl(srv.icon)} alt="icon" className="w-12 h-12" />
                    ) : (
                      <svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4"></path></svg>
                    )}
                  </div>
                  <h3 className={`text-2xl font-bold ${textDark} mb-4 group-hover:text-[#D6002F] transition-colors`}>{srv.title}</h3>
                  <button className={`inline-block mt-4 font-semibold ${textMuted} group-hover:text-[#D6002F] transition-colors relative after:content-[''] after:absolute after:w-4 after:h-[2px] after:bg-current after:top-1/2 after:-right-6`}>
                    Learn More
                  </button>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* PORTFOLIO SECTION */}
      {projects.length > 0 && (
        <section id="portfolio" className={`py-24 ${bgLight}`}>
          <div className="max-w-7xl mx-auto px-6">
            <div className="mb-16">
              <span className={`${primaryColor} font-medium flex items-center gap-4`}>
                Portfolio <span className="w-10 h-[1px] bg-[#D6002F]"></span>
              </span>
              <h2 className={`text-4xl font-bold ${textDark} mt-4`}>Recent Projects</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {projects.map((proj, idx) => (
                <div 
                  key={idx} 
                  onClick={() => setModalData({
                    title: proj.title,
                    content: proj.description, // Merujuk pada kolom di Supabase/SQL
                    image: proj.image
                  })}
                  onMouseEnter={() => setIsHovering(true)}
                  onMouseLeave={() => setIsHovering(false)}
                  className="group relative h-80 rounded-xl overflow-hidden cursor-pointer"
                >
                  <div className="absolute inset-0 bg-gray-300 dark:bg-gray-800 bg-cover bg-center transition-transform duration-500 group-hover:scale-110" style={{ backgroundImage: `url('${getImageUrl(proj.image)}')` }}></div>
                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  
                  <div className="absolute bottom-0 left-0 p-8 z-10 translate-y-4 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300">
                    <h3 className="text-2xl font-bold text-white mb-2">{proj.title}</h3>
                    <span className="text-white/80">View Detail</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* CONTACT SECTION */}
      <section id="contact" className={`py-24 ${bgAlt}`}>
        <div className="max-w-7xl mx-auto px-6 flex flex-col lg:flex-row gap-16">
          <div className="w-full lg:w-1/2">
            <div className="mb-12">
              <span className={`${primaryColor} font-medium flex items-center gap-4`}>
                Contact <span className="w-10 h-[1px] bg-[#D6002F]"></span>
              </span>
              <h2 className={`text-4xl font-bold ${textDark} mt-4`}>Let's discuss your project</h2>
            </div>
            <ul className="space-y-6">
              <li className="flex items-center gap-4">
                <span className="text-2xl">📞</span> 
                <span className="text-lg">{profile.phone}</span>
              </li>
              <li className="flex items-center gap-4">
                <span className="text-2xl">✉️</span> 
                <span className="text-lg hover:text-[#D6002F] transition-colors"><a href={`mailto:${profile.email}`}>{profile.email}</a></span>
              </li>
              <li className="flex items-center gap-4">
                <span className="text-2xl">📍</span> 
                <span className="text-lg">{profile.address}</span>
              </li>
            </ul>
          </div>

          <div className="w-full lg:w-1/2">
            <h3 className={`text-2xl leading-relaxed mb-10 ${textDark}`}>
              I'm always open to discussing product <br/> <span className="font-bold">design work or partnerships.</span>
            </h3>
            
            <form className="flex flex-col gap-8" onSubmit={(e) => e.preventDefault()}>
              <input type="text" placeholder="Name*" className={`w-full bg-transparent border-b border-gray-300 dark:border-gray-700 py-4 focus:outline-none focus:border-[#0F172A] dark:focus:border-white transition-colors ${textDark}`} />
              
              <div className="flex flex-col md:flex-row gap-8">
                <input type="email" placeholder="Email*" className={`w-full bg-transparent border-b border-gray-300 dark:border-gray-700 py-4 focus:outline-none focus:border-[#0F172A] dark:focus:border-white transition-colors ${textDark}`} />
                <input type="text" placeholder="Subject*" className={`w-full bg-transparent border-b border-gray-300 dark:border-gray-700 py-4 focus:outline-none focus:border-[#0F172A] dark:focus:border-white transition-colors ${textDark}`} />
              </div>
              
              <textarea placeholder="Message*" rows={3} className={`w-full bg-transparent border-b border-gray-300 dark:border-gray-700 py-4 focus:outline-none focus:border-[#0F172A] dark:focus:border-white transition-colors resize-none ${textDark}`}></textarea>
              
              <button 
                onMouseEnter={() => setIsHovering(true)}
                onMouseLeave={() => setIsHovering(false)}
                className="self-start px-10 py-4 border-2 border-[#7E7E7E] dark:border-[#A9AFC3] rounded-md font-medium text-inherit hover:border-[#D6002F] hover:text-[#D6002F] transition-all"
              >
                Submit
              </button>
            </form>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="bg-[#191C26] py-10">
        <div className="max-w-7xl mx-auto px-6 text-center md:text-left">
          <p className="text-gray-400">Copyright &copy; {new Date().getFullYear()}. All rights are reserved.</p>
        </div>
      </footer>

      {/* ========================================= */}
      {/* MODAL UNIVERSAL                           */}
      {/* ========================================= */}
      {modalData && (
        <div className="fixed inset-0 z-[99999] flex items-center justify-center p-4 md:p-10 bg-black/80 backdrop-blur-sm transition-opacity">
          <div 
            className="absolute inset-0 cursor-pointer" 
            onClick={() => setModalData(null)}
            onMouseEnter={() => setIsHovering(true)}
            onMouseLeave={() => setIsHovering(false)}
          ></div>
          <div className={`relative w-full max-w-7xl max-h-full overflow-y-auto rounded-2xl shadow-2xl p-8 md:p-12 ${bgLight} z-10 animate-[fadeIn_0.3s_ease-out]`}>
            <button 
              onClick={() => setModalData(null)}
              onMouseEnter={() => setIsHovering(true)}
              onMouseLeave={() => setIsHovering(false)}
              className="absolute top-6 right-6 p-2 rounded-full border-2 border-gray-300 dark:border-gray-600 hover:border-black dark:hover:border-white hover:text-black dark:hover:text-white transition-colors"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
            
            <h2 className={`text-3xl md:text-4xl font-bold ${textDark} mb-6 pr-10`}>{modalData.title}</h2>
            
            <div 
              className={`text-base md:text-lg leading-relaxed ${textMuted} mb-8 modal-rich-text`}
              dangerouslySetInnerHTML={{ __html: modalData.content }}
            />
            
            {modalData.image && (
              <div className="w-full rounded-xl overflow-hidden border border-gray-200 dark:border-gray-700 mt-6">
                <img src={getImageUrl(modalData.image)} alt={modalData.title} className="w-full h-auto object-cover" />
              </div>
            )}
          </div>
        </div>
      )}

    </div>
  );
}