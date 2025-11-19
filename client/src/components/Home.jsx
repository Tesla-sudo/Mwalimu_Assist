// src/pages/Home.jsx  (or src/components/Home.jsx)
import React from 'react';
import { Link } from 'react-router-dom';
import Navbar from './Navbar';
import { 
  BookOpen, 
  Users, 
  MessageCircle, 
  Brain, 
  Shield, 
  Zap,
  CheckCircle,
  ArrowRight,
  Star,
  Globe,
  Heart
} from 'lucide-react';

const Home = () => {
  return (
    <>
    <Navbar />
    <div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-green-50">

      {/* Hero Section - Kenyan Pride */}
      <section className="relative overflow-hidden py-20 px-6">
        <div className="absolute inset-0 bg-gradient-to-br from-red-600/10 via-black/5 to-green-600/10"></div>
        
        <div className="max-w-7xl mx-auto text-center relative z-10">
          <div className="mb-8">
            <h1 className="text-5xl md:text-7xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-red-600 via-black to-green-600 mb-6">
              MWALIMU ASSIST
            </h1>
            <p className="text-3xl md:text-5xl font-bold text-gray-800 mb-4">
              The #1 Free App for Kenyan Teachers
            </p>
            <p className="text-xl md:text-2xl text-gray-700 max-w-4xl mx-auto">
              CBE Schemes • Lesson Plans • Exams • Attendance • AI Tools • Community Chat
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-6 justify-center items-center mt-12">
            <Link 
              to="/login"
              className="px-12 py-6 bg-gradient-to-r from-red-600 via-black to-green-600 text-white font-bold text-2xl rounded-2xl shadow-2xl hover:shadow-3xl transition-all hover:scale-105 flex items-center gap-4"
            >
              Start Teaching Better Today
              <ArrowRight className="w-8 h-8" />
            </Link>
            <Link 
              to="/register"
              className="px-12 py-6 bg-white border-4 border-black text-black font-bold text-2xl rounded-2xl shadow-2xl hover:shadow-3xl transition-all hover:scale-105"
            >
              Create Free Account
            </Link>
          </div>

          <div className="mt-16 flex justify-center gap-8 text-gray-700">
            <div className="text-center">
              <p className="text-5xl font-bold text-green-600">50,000+</p>
              <p className="text-xl font-medium">Teachers Using</p>
            </div>
            <div className="text-center">
              <p className="text-5xl font-bold text-blue-600">4.9</p>
              <p className="text-xl font-medium">Rating</p>
            </div>
            <div className="text-center">
              <p className="text-5xl font-bold text-purple-600">100%</p>
              <p className="text-xl font-medium">Free Forever</p>
            </div>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-20 px-6 bg-white/95">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-5xl font-bold text-center text-gray-800 mb-16">
            Everything a Kenyan Teacher Needs
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              { icon: Brain, title: "Gemini AI Generator", desc: "Lesson Plans, Schemes, Exams, Rubrics in seconds", color: "from-purple-500 to-pink-500" },
              { icon: BookOpen, title: "CBC Perfect Content", desc: "KICD-aligned • With YouTube links • Ready to teach", color: "from-blue-500 to-cyan-500" },
              { icon: Users, title: "Teachers Community", desc: "Real-time chat • Share ideas • Get support 24/7", color: "from-green-500 to-emerald-500" },
              { icon: CheckCircle, title: "Digital Attendance", desc: "Mark register • Export PDF • TSC ready", color: "from-orange-500 to-red-500" },
              { icon: Shield, title: "100% Secure & Private", desc: "Only verified teachers • No ads • No data selling", color: "from-gray-600 to-black" },
              { icon: Zap, title: "Works Offline", desc: "Use in rural areas • No internet needed for most tools", color: "from-yellow-500 to-orange-500" }
            ].map((feature, i) => (
              <div key={i} className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-3xl p-8 shadow-xl hover:shadow-2xl transition-all hover:scale-105 border-4 border-white">
                <div className={`w-20 h-20 bg-gradient-to-br ${feature.color} rounded-2xl flex items-center justify-center mb-6 text-white`}>
                  <feature.icon className="w-12 h-12" />
                </div>
                <h3 className="text-2xl font-bold text-gray-800 mb-4">{feature.title}</h3>
                <p className="text-lg text-gray-600">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 px-6 bg-gradient-to-br from-indigo-50 to-purple-50">
        <div className="max-w-6xl mx-auto text-center">
          <h2 className="text-5xl font-bold text-gray-800 mb-16">
            What Kenyan Teachers Are Saying
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
            {[
              { name: "Mwalimu Jane, Nairobi", text: "This app saved me 10 hours a week. Gemini writes better schemes than me!" },
              { name: "Teacher Otieno, Kisumu", text: "The community chat helped me when TSC delayed salary. I felt supported." },
              { name: "Madam Amina, Mombasa", text: "Finally an app that understands CBC and Kenyan teachers. Asante sana!" }
            ].map((t, i) => (
              <div key={i} className="bg-white rounded-3xl p-8 shadow-2xl">
                <div className="flex justify-center mb-4">
                  {[...Array(5)].map((_, j) => <Star key={j} className="w-8 h-8 text-yellow-500 fill-current" />)}
                </div>
                <p className="text-xl text-gray-700 italic mb-6">"{t.text}"</p>
                <p className="font-bold text-lg text-indigo-600">{t.name}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-20 px-6 text-center">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-5xl md:text-6xl font-bold text-gray-800 mb-8">
            Join 50,000+ Kenyan Teachers Today
          </h2>
          <p className="text-2xl text-gray-700 mb-12">
            Free • No Ads • Made in Kenya • For Kenyan Teachers
          </p>

          <div className="flex flex-col sm:flex-row gap-6 justify-center">
            <Link 
              to="/register"
              className="px-16 py-8 bg-gradient-to-r from-red-600 via-black to-green-600 text-white font-bold text-3xl rounded-3xl shadow-3xl hover:shadow-4xl transition-all hover:scale-110"
            >
              Create Your Free Account Now
            </Link>
          </div>

          <div className="mt-16 flex justify-center items-center gap-8 text-6xl">
            <span className="text-red-600">Red</span>
            <span className="text-black">Black</span>
            <span className="text-green-600">Green</span>
            <Heart className="w-16 h-16 text-red-600 fill-current" />
          </div>

          <p className="text-3xl font-bold text-gray-800 mt-8">
            Pamoja Tunaweza • Mwalimu Assist ni Yetu
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-black text-white py-12 px-6 text-center">
        <p className="text-2xl font-bold mb-4">MWALIMU ASSIST</p>
        <p className="text-lg opacity-90">Made with Kenya Flag for Kenyan Teachers</p>
        <p className="mt-8 text-sm opacity-70">© 2025 Mwalimu Assist • Free Forever</p>
      </footer>
    </div>
    </>
  );
};

export default Home;