import React from 'react';
import { useState } from 'react';
import { Routes, Route, NavLink } from 'react-router-dom';
import { Mail, MessageCircle } from 'lucide-react';
import AnimatedBackground from './components/AnimatedBackground';
import GradientText from './components/GradientText';
import NeonButton from './components/NeonButton';
import ProfileImage from './components/ProfileImage';
import TypingText from './components/TypingText';
import LoadingScreen from './components/LoadingScreen';
import Navbar from './components/Navbar';

function Home() {
  const handleContactEmail = () => {
    window.location.href = 'mailto:eleanoretefo1@gmail.com';
  };
  const handleWhatsApp = () => {
    window.open('https://wa.me/201227866673', '_blank');
  };
  return (
    <div className="relative z-10 min-h-screen px-6 py-12 pt-28 md:pt-32">
      <div className="mx-auto max-w-6xl grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
        <div className="order-2 lg:order-1 text-left space-y-8">
          <div className="space-y-4">
            <GradientText className="text-4xl md:text-6xl lg:text-7xl font-bold tracking-tight">
              <h1>Mohamed Atef</h1>
            </GradientText>
            <GradientText className="text-3xl md:text-5xl lg:text-6xl font-bold tracking-tight">
              <h2>Abdelsattar</h2>
            </GradientText>
          </div>
          <GradientText className="text-lg md:text-2xl lg:text-3xl font-bold">
            <TypingText
              text="A Full Stack Developer and Web Solutions Expert with hands-on experience in building responsive websites, modern web applications, and delivering high-quality digital products tailored to client needs."
              speedMs={20}
            />
          </GradientText>
          <div className="flex flex-col sm:flex-row gap-4 sm:gap-6 justify-start items-center pt-2">
            <NeonButton icon={Mail} onClick={handleContactEmail} variant="primary">
              Contact Me
            </NeonButton>
            <NeonButton icon={MessageCircle} onClick={handleWhatsApp} variant="secondary">
              WhatsApp
            </NeonButton>
          </div>
        </div>
        <div className="order-1 lg:order-2 flex justify-center lg:justify-end">
          <ProfileImage />
        </div>
      </div>
    </div>
  );
}

function Works() {
  return (
    <div className="relative z-10 min-h-screen px-6 py-28">
      <div className="mx-auto max-w-6xl">
        <h3 className="text-3xl font-bold text-white mb-4">Our Works</h3>
        <p className="text-white/70">Showcase coming soon.</p>
      </div>
    </div>
  );
}
function Skills() {
  return (
    <div className="relative z-10 min-h-screen px-6 py-28">
      <div className="mx-auto max-w-6xl">
        <h3 className="text-3xl font-bold text-white mb-4">Skills</h3>
        <p className="text-white/70">Skills content coming soon.</p>
      </div>
    </div>
  );
}
function About() {
  return (
    <div className="relative z-10 min-h-screen px-6 py-28">
      <div className="mx-auto max-w-6xl">
        <h3 className="text-3xl font-bold text-white mb-4">About</h3>
        <p className="text-white/70">About section coming soon.</p>
      </div>
    </div>
  );
}
function Contact() {
  return (
    <div className="relative z-10 min-h-screen px-6 py-28">
      <div className="mx-auto max-w-6xl">
        <h3 className="text-3xl font-bold text-white mb-4">Contact</h3>
        <p className="text-white/70">Contact details coming soon.</p>
      </div>
    </div>
  );
}
function Login() {
  return (
    <div className="relative z-10 min-h-screen px-6 py-28">
      <div className="mx-auto max-w-6xl">
        <h3 className="text-3xl font-bold text-white mb-4">Login</h3>
        <p className="text-white/70">Authentication coming soon.</p>
      </div>
    </div>
  );
}

function App() {
  const [isLoading, setIsLoading] = useState(true);
  const handleLoadingComplete = () => setIsLoading(false);
  if (isLoading) {
    return <LoadingScreen onLoadingComplete={handleLoadingComplete} />;
  }
  return (
    <div className="min-h-screen bg-gray-900 relative overflow-hidden">
      <Navbar />
      <AnimatedBackground />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/works" element={<Works />} />
        <Route path="/skills" element={<Skills />} />
        <Route path="/about" element={<About />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/login" element={<Login />} />
        <Route path="*" element={<Home />} />
      </Routes>
    </div>
  );
}

export default App;