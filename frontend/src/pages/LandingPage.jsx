import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import {
  Menu,
  X,
  Clock,
  CheckCircle,
  Users,
  BarChart3,
  Calendar,
  Shield,
  Github,
  ExternalLink,
  Star,
  ArrowRight,
  Zap,
  Globe,
  TrendingUp,
  Lock,
  Heart
} from 'lucide-react';

const features = [
  {
    icon: Clock,
    title: 'Check-in/Check-out Otomatis',
    description: 'Sistem pencatatan kehadiran dengan GPS tracking dan auto-time detection yang akurat.',
    color: 'from-blue-500 to-blue-600'
  },
  {
    icon: CheckCircle,
    title: 'Task Management',
    description: 'Kelola tugas harian dengan status tracking dan progress monitoring real-time.',
    color: 'from-green-500 to-green-600'
  },
  {
    icon: Users,
    title: 'Team Management',
    description: 'Kelola tim, atur hak akses, dan monitor performa karyawan secara efisien.',
    color: 'from-purple-500 to-purple-600'
  },
  {
    icon: BarChart3,
    title: 'Analytics Dashboard',
    description: 'Laporan komprehensif dengan grafik interaktif untuk insight bisnis.',
    color: 'from-orange-500 to-orange-600'
  },
  {
    icon: Calendar,
    title: 'Leave & Holiday Management',
    description: 'Sistem cuti dan libur terintegrasi dengan approval workflow yang fleksibel.',
    color: 'from-pink-500 to-pink-600'
  },
  {
    icon: Shield,
    title: 'Security & Privacy',
    description: 'Data terenkripsi, multi-tenant architecture, dan akses kontrol berbasis peran.',
    color: 'from-red-500 to-red-600'
  }
];

const testimonials = [
  {
    name: 'Wazir Qorni Abud',
    role: 'CEO, Santri Link',
    content: 'WFH Attendance System sangat membantu tim kami yang bekerja remote. Dashboardnya lengkap dan mudah digunakan.',
    rating: 5,
    avatar: 'https://randomuser.me/api/portraits/men/32.jpg'
  },
  {
    name: 'Adam Ahmad',
    role: 'HR Manager, Digital Agency Gresik',
    content: 'Sistem yang powerful namun tetap user-friendly. Fitur laporan kehadirannya sangat detail dan membantu proses payroll.',
    rating: 5,
    avatar: 'https://randomuser.me/api/portraits/men/70.jpg'
  },
  {
    name: 'Gabriel Dimas Wicaksono',
    role: 'CTO, Creative Studio Malang',
    content: 'Open source solution yang sangat value for money. Kami bisa custom sesuai kebutuhan tanpa biaya license.',
    rating: 5,
    avatar: 'https://randomuser.me/api/portraits/men/85.jpg'
  }
];

const stats = [
  { label: 'Perusahaan', value: '500+', icon: TrendingUp },
  { label: 'Pengguna Aktif', value: '10K+', icon: Users },
  { label: 'Check-in/hari', value: '50K+', icon: Clock },
  { label: 'Kepuasan', value: '98%', icon: Heart }
];

// Intersection Observer for animations
const useIntersectionObserver = (ref, options = {}) => {
  const [isIntersecting, setIsIntersecting] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => {
      setIsIntersecting(entry.isIntersecting);
    }, options);

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => {
      if (ref.current) {
        observer.unobserve(ref.current);
      }
    };
  }, [ref, options]);

  return isIntersecting;
};

// Lazy loading for images
const LazyImage = ({ src, alt, className, ...props }) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isInView, setIsInView] = useState(false);
  const imgRef = useRef();

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true);
          observer.disconnect();
        }
      },
      { threshold: 0.1 }
    );

    if (imgRef.current) {
      observer.observe(imgRef.current);
    }

    return () => observer.disconnect();
  }, []);

  return (
    <div ref={imgRef} className={`relative overflow-hidden ${className}`}>
      {isInView && (
        <img
          src={src}
          alt={alt}
          onLoad={() => setIsLoaded(true)}
          className={`transition-opacity duration-500 ${isLoaded ? 'opacity-100' : 'opacity-0'} ${className}`}
          {...props}
        />
      )}
      {!isLoaded && (
        <div className={`absolute inset-0 bg-gray-200 animate-pulse ${className}`} />
      )}
    </div>
  );
};

export const LandingPage = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [activeTestimonial, setActiveTestimonial] = useState(0);
  const [isLoaded, setIsLoaded] = useState(false);

  // Refs for intersection observer
  const heroRef = useRef();
  const featuresRef = useRef();
  const statsRef = useRef();
  const testimonialsRef = useRef();
  const ctaRef = useRef();

  // Intersection observers
  const heroInView = useIntersectionObserver(heroRef, { threshold: 0.1 });
  const featuresInView = useIntersectionObserver(featuresRef, { threshold: 0.1 });
  const statsInView = useIntersectionObserver(statsRef, { threshold: 0.1 });
  const testimonialsInView = useIntersectionObserver(testimonialsRef, { threshold: 0.1 });
  const ctaInView = useIntersectionObserver(ctaRef, { threshold: 0.1 });

  useEffect(() => {
    setIsLoaded(true);

    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };

    const interval = setInterval(() => {
      setActiveTestimonial((prev) => (prev + 1) % testimonials.length);
    }, 5000);

    window.addEventListener('scroll', handleScroll);
    return () => {
      window.removeEventListener('scroll', handleScroll);
      clearInterval(interval);
    };
  }, []);

  // Close mobile menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (isMenuOpen && !event.target.closest('nav')) {
        setIsMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isMenuOpen]);

  // Close mobile menu on scroll
  useEffect(() => {
    const handleScroll = () => {
      if (isMenuOpen) {
        setIsMenuOpen(false);
      }
    };

    if (isMenuOpen) {
      window.addEventListener('scroll', handleScroll);
      return () => window.removeEventListener('scroll', handleScroll);
    }
  }, [isMenuOpen]);

  const handleMenuClose = () => {
    setIsMenuOpen(false);
  };

  const handleNavClick = (section) => {
    setIsMenuOpen(false);
    const element = document.getElementById(section);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const renderStars = (rating) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`w-4 h-4 ${i < rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`}
      />
    ));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 overflow-hidden">
      {/* Background Animation */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-300 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-purple-300 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-2000"></div>
        <div className="absolute top-40 left-40 w-80 h-80 bg-pink-300 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-4000"></div>
      </div>

      {/* Navigation */}
      <nav className={`fixed top-0 w-full z-50 transition-all duration-300 ${
        scrolled ? 'bg-white/95 backdrop-blur-md shadow-lg' : 'bg-transparent'
      }`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-2">
              <div className="relative">
                <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                  <Clock className="w-5 h-5 text-white" />
                </div>
                <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg animate-ping opacity-20"></div>
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                WFH Attendance
              </span>
            </div>

            {/* Desktop Menu */}
            <div className="hidden md:flex items-center space-x-8">
              <button
                onClick={() => handleNavClick('features')}
                className="text-gray-700 hover:text-blue-600 transition-colors font-medium"
              >
                Fitur
              </button>
              <button
                onClick={() => handleNavClick('testimonials')}
                className="text-gray-700 hover:text-blue-600 transition-colors font-medium"
              >
                Testimoni
              </button>
              <button
                onClick={() => handleNavClick('opensource')}
                className="text-gray-700 hover:text-blue-600 transition-colors font-medium"
              >
                Open Source
              </button>
              <a
                href="https://github.com/tsdlamongan/WFH-Attendance-System"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-700 hover:text-blue-600 transition-colors flex items-center space-x-1 font-medium"
              >
                <Github className="w-4 h-4" />
                <span>GitHub</span>
              </a>
            </div>

            <div className="hidden md:flex items-center space-x-4">
              <Link
                to="/login"
                className="text-blue-600 hover:text-blue-700 font-medium transition-colors"
              >
                Masuk
              </Link>
              <Link
                to="/register"
                className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-4 py-2 rounded-lg hover:shadow-lg transform hover:scale-105 transition-all duration-200 font-semibold"
              >
                Daftar Gratis
              </Link>
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="md:hidden p-2 rounded-lg text-gray-700 hover:bg-gray-100 transition-colors"
              aria-label="Toggle menu"
            >
              {isMenuOpen ? (
                <X className="w-6 h-6 animate-rotate-180" />
              ) : (
                <Menu className="w-6 h-6" />
              )}
            </button>
          </div>

          {/* Mobile Menu */}
          <div className={`md:hidden absolute top-16 left-0 right-0 bg-white shadow-lg rounded-b-2xl transition-all duration-300 ${
            isMenuOpen ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-4 pointer-events-none'
          }`}>
            <div className="px-4 py-6 space-y-4">
              <button
                onClick={() => handleNavClick('features')}
                className="block w-full text-left text-gray-700 hover:text-blue-600 transition-colors font-medium"
              >
                Fitur
              </button>
              <button
                onClick={() => handleNavClick('testimonials')}
                className="block w-full text-left text-gray-700 hover:text-blue-600 transition-colors font-medium"
              >
                Testimoni
              </button>
              <button
                onClick={() => handleNavClick('opensource')}
                className="block w-full text-left text-gray-700 hover:text-blue-600 transition-colors font-medium"
              >
                Open Source
              </button>
              <a
                href="https://github.com/tsdlamongan/WFH-Attendance-System"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center space-x-2 text-gray-700 hover:text-blue-600 font-medium"
              >
                <Github className="w-4 h-4" />
                <span>GitHub</span>
              </a>
              <div className="pt-4 border-t border-gray-200 space-y-3">
                <Link
                  to="/login"
                  onClick={handleMenuClose}
                  className="block text-center text-blue-600 hover:text-blue-700 font-medium"
                >
                  Masuk
                </Link>
                <Link
                  to="/register"
                  onClick={handleMenuClose}
                  className="block bg-gradient-to-r from-blue-600 to-purple-600 text-white px-4 py-2 rounded-lg text-center font-semibold"
                >
                  Daftar Gratis
                </Link>
              </div>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section ref={heroRef} className="pt-24 pb-12 px-4 sm:px-6 lg:px-8 relative">
        <div className="max-w-7xl mx-auto">
          <div className={`text-center space-y-8 transition-all duration-700 ${
            isLoaded && heroInView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
          }`}>
            <div className="space-y-6">
              <div className="inline-flex items-center space-x-2 bg-blue-100 text-blue-700 px-4 py-2 rounded-full text-sm font-medium">
                <Zap className="w-4 h-4" />
                <span>100% Gratis & Open Source</span>
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent leading-tight">
                Sistem Kehadiran
                <br />
                <span className="text-3xl sm:text-4xl lg:text-5xl">Remote Work Terbaik</span>
              </h1>

              <p className="text-lg sm:text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
                Solusi lengkap untuk manajemen kehadiran tim remote work Anda.
                <span className="font-semibold text-blue-600"> 100% Gratis & Open Source</span> -
                Tanpa biaya berlangganan, tanpa batasan pengguna.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Link
                to="/register"
                className="group w-full sm:w-auto bg-gradient-to-r from-blue-600 to-purple-600 text-white px-8 py-4 rounded-xl hover:shadow-xl transform hover:scale-105 transition-all duration-200 font-semibold text-lg flex items-center justify-center space-x-2"
              >
                <span>Mulai Gratis Sekarang</span>
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Link>
              <a
                href="https://github.com/tsdlamongan/WFH-Attendance-System"
                target="_blank"
                rel="noopener noreferrer"
                className="w-full sm:w-auto inline-flex items-center justify-center space-x-2 border border-gray-300 px-8 py-4 rounded-xl hover:bg-gray-50 hover:border-gray-400 transition-all duration-200"
              >
                <Github className="w-5 h-5" />
                <span className="font-semibold">View on GitHub</span>
                <ExternalLink className="w-4 h-4" />
              </a>
            </div>

            <div className="grid grid-cols-2 gap-4 sm:flex sm:flex-wrap sm:justify-center sm:gap-6 text-sm text-gray-600 max-w-md mx-auto">
              {[
                { icon: CheckCircle, text: 'Tanpa Setup' },
                { icon: Globe, text: 'Mobile Friendly' },
                { icon: Heart, text: 'Support Indonesia' },
                { icon: Zap, text: 'Update Berkala' }
              ].map((item, index) => (
                <div key={index} className="flex items-center space-x-1">
                  <item.icon className="w-4 h-4 text-green-500" />
                  <span>{item.text}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section ref={statsRef} className="py-12 px-4 sm:px-6 lg:px-8 bg-white/50 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto">
          <div className={`grid grid-cols-2 lg:grid-cols-4 gap-8 transition-all duration-700 delay-100 ${
            isLoaded && statsInView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
          }`}>
            {stats.map((stat, index) => (
              <div key={index} className="text-center group">
                <div className="flex justify-center mb-2">
                  <div className="w-12 h-12 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
                    <stat.icon className="w-6 h-6 text-white" />
                  </div>
                </div>
                <div className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  {stat.value}
                </div>
                <div className="text-gray-600 mt-1">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section ref={featuresRef} id="features" className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className={`text-center mb-12 transition-all duration-700 delay-200 ${
            isLoaded && featuresInView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
          }`}>
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              Fitur Lengkap untuk Tim Anda
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Semua yang Anda butuhkan untuk mengelola kehadiran tim remote work dalam satu platform
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            {features.map((feature, index) => (
              <div
                key={index}
                className={`bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-300 group ${
                  isLoaded && featuresInView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
                }`}
                style={{ transitionDelay: `${300 + index * 100}ms` }}
              >
                <div className={`w-12 h-12 bg-gradient-to-r ${feature.color} rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                  <feature.icon className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  {feature.title}
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section ref={testimonialsRef} id="testimonials" className="py-16 px-4 sm:px-6 lg:px-8 bg-white/50 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto">
          <div className={`text-center mb-12 transition-all duration-700 delay-300 ${
            isLoaded && testimonialsInView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
          }`}>
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              Dipercaya oleh Perusahaan Indonesia
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Lihat apa kata mereka tentang WFH Attendance System
            </p>
          </div>

          <div className="max-w-4xl mx-auto">
            <div className={`relative transition-all duration-700 delay-400 ${
              isLoaded && testimonialsInView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
            }`}>
              <div className="bg-white rounded-2xl p-8 shadow-xl">
                <div className="flex items-center space-x-1 mb-4">
                  {renderStars(testimonials[activeTestimonial].rating)}
                </div>
                <blockquote className="text-lg text-gray-700 mb-6 italic">
                  "{testimonials[activeTestimonial].content}"
                </blockquote>
                <div className="flex items-center space-x-4">
                  <LazyImage
                    src={testimonials[activeTestimonial].avatar}
                    alt={testimonials[activeTestimonial].name}
                    className="w-12 h-12 rounded-full object-cover"
                  />
                  <div>
                    <div className="font-semibold text-gray-900">
                      {testimonials[activeTestimonial].name}
                    </div>
                    <div className="text-gray-600">
                      {testimonials[activeTestimonial].role}
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex justify-center space-x-2 mt-6">
                {testimonials.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setActiveTestimonial(index)}
                    className={`w-2 h-2 rounded-full transition-all duration-200 ${
                      index === activeTestimonial ? 'bg-blue-600 w-8' : 'bg-gray-300'
                    }`}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Open Source Section */}
      <section ref={ctaRef} id="opensource" className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className={`text-center mb-12 transition-all duration-700 delay-500 ${
            isLoaded && ctaInView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
          }`}>
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              100% Gratis & Open Source
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Kami percaya bahwa tools untuk remote work harus bisa diakses oleh semua perusahaan
            </p>
          </div>

          <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-center">
            <div className="space-y-6">
              {[
                {
                  icon: CheckCircle,
                  title: 'Tanpa Biaya Berlangganan',
                  description: 'Tidak ada biaya setup, bulanan, atau per pengguna. Benar-benar gratis.'
                },
                {
                  icon: Lock,
                  title: 'Full Source Code Access',
                  description: 'Customize sesuai kebutuhan bisnis Anda dengan full source code.'
                },
                {
                  icon: Users,
                  title: 'Community Driven',
                  description: 'Dikembangkan bersama community, dengan update berkala dan bug fixes.'
                },
                {
                  icon: Shield,
                  title: 'Self-Hosted',
                  description: 'Data perusahaan Anda aman karena bisa di-host di server sendiri.'
                }
              ].map((item, index) => (
                <div key={index} className={`flex items-start space-x-4 transition-all duration-700 delay-${600 + index * 100} ${
                  isLoaded && ctaInView ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-10'
                }`}>
                  <div className="w-6 h-6 bg-gradient-to-r from-green-500 to-green-600 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                    <item.icon className="w-3 h-3 text-white" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-1">{item.title}</h3>
                    <p className="text-gray-600">{item.description}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-8 text-white text-center space-y-6 transform hover:scale-105 transition-transform duration-300">
              <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center mx-auto">
                <Github className="w-8 h-8" />
              </div>
              <div>
                <h3 className="text-2xl font-bold mb-2">Contribute to Project</h3>
                <p className="text-blue-100">
                  Bergabunglah dengan kami dalam mengembangkan sistem kehadiran terbaik untuk Indonesia
                </p>
              </div>
              <a
                href="https://github.com/tsdlamongan/WFH-Attendance-System"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center space-x-2 bg-white text-blue-600 px-6 py-3 rounded-lg hover:bg-blue-50 transition-colors font-semibold"
              >
                <Github className="w-5 h-5" />
                <span>View on GitHub</span>
                <ExternalLink className="w-4 h-4" />
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-gradient-to-r from-blue-600 to-purple-600">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-6">
            Siap Memulai?
          </h2>
          <p className="text-xl text-blue-100 mb-8">
            Bergabunglah dengan ratusan perusahaan yang sudah menggunakan WFH Attendance System
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/register"
              className="bg-white text-blue-600 px-8 py-4 rounded-xl hover:shadow-xl transform hover:scale-105 transition-all duration-200 font-semibold text-lg flex items-center justify-center space-x-2"
            >
              <span>Daftar Gratis Sekarang</span>
              <ArrowRight className="w-5 h-5" />
            </Link>
            <a
              href="https://github.com/tsdlamongan/WFH-Attendance-System"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center space-x-2 border-2 border-white text-white px-8 py-4 rounded-xl hover:bg-white/10 transition-colors"
            >
              <Github className="w-5 h-5" />
              <span className="font-semibold">Star on GitHub</span>
            </a>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-300 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                  <Clock className="w-5 h-5 text-white" />
                </div>
                <span className="text-xl font-bold text-white">WFH Attendance</span>
              </div>
              <p className="text-sm">
                Sistem kehadiran remote work gratis dan open source untuk perusahaan Indonesia.
              </p>
            </div>

            <div className="space-y-4">
              <h4 className="font-semibold text-white">Product</h4>
              <ul className="space-y-2 text-sm">
                <li><button onClick={() => handleNavClick('features')} className="hover:text-white transition-colors">Features</button></li>
                <li><button onClick={() => handleNavClick('testimonials')} className="hover:text-white transition-colors">Testimonials</button></li>
                <li><Link to="/login" className="hover:text-white transition-colors">Login</Link></li>
                <li><Link to="/register" className="hover:text-white transition-colors">Register</Link></li>
              </ul>
            </div>

            <div className="space-y-4">
              <h4 className="font-semibold text-white">Resources</h4>
              <ul className="space-y-2 text-sm">
                <li>
                  <a
                    href="https://github.com/tsdlamongan/WFH-Attendance-System"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:text-white transition-colors flex items-center space-x-1"
                  >
                    <Github className="w-3 h-3" />
                    <span>GitHub</span>
                  </a>
                </li>
                <li>
                  <a
                    href="https://github.com/tsdlamongan/WFH-Attendance-System/blob/main/README.md"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:text-white transition-colors flex items-center space-x-1"
                  >
                    <ExternalLink className="w-3 h-3" />
                    <span>Documentation</span>
                  </a>
                </li>
                <li>
                  <a
                    href="https://github.com/tsdlamongan/WFH-Attendance-System/issues"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:text-white transition-colors flex items-center space-x-1"
                  >
                    <ExternalLink className="w-3 h-3" />
                    <span>Support</span>
                  </a>
                </li>
              </ul>
            </div>

            <div className="space-y-4">
              <h4 className="font-semibold text-white">Legal</h4>
              <ul className="space-y-2 text-sm">
                <li>
                  <a
                    href="https://github.com/tsdlamongan/WFH-Attendance-System/blob/main/LICENSE"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:text-white transition-colors"
                  >
                    License (MIT)
                  </a>
                </li>
                <li>
                  <a
                    href="https://github.com/tsdlamongan/WFH-Attendance-System/blob/main/.github/PRIVACY.md"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:text-white transition-colors"
                  >
                    Privacy Policy
                  </a>
                </li>
                <li>
                  <a
                    href="https://github.com/tsdlamongan/WFH-Attendance-System/blob/main/.github/TERMS.md"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:text-white transition-colors"
                  >
                    Terms of Service
                  </a>
                </li>
              </ul>
            </div>
          </div>

          <div className="border-t border-gray-800 mt-8 pt-8 flex flex-col sm:flex-row justify-between items-center">
            <p className="text-sm text-gray-400">
              © 2025 WFH Attendance System. Coded by ❤️ Project open source dari PT Teknologi Sunan Drajat Lamongan untuk Indonesia.
            </p>
            <div className="flex items-center space-x-4 mt-4 sm:mt-0">
              <a
                href="https://github.com/tsdlamongan/WFH-Attendance-System"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-400 hover:text-white transition-colors"
              >
                <Github className="w-5 h-5" />
              </a>
            </div>
          </div>
        </div>
      </footer>

      </div>
  );
};