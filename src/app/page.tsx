import Link from "next/link";
import AITwinButton from "./components/AITwinButton";

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col">
      {/* Hero Section */}
      <section className="relative bg-slate-900 text-white overflow-hidden min-h-[90vh] flex items-center">
        <div className="absolute inset-0 bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900"></div>
        <div className="absolute inset-0 opacity-5">
          <div className="absolute top-20 left-20 w-96 h-96 bg-white rounded-full blur-3xl"></div>
          <div className="absolute bottom-20 right-20 w-96 h-96 bg-slate-700 rounded-full blur-3xl"></div>
        </div>
        
        <div className="relative container mx-auto px-6 py-24">
          <div className="max-w-5xl mx-auto text-center">
            <div className="mb-8">
              <span className="inline-block bg-white/10 backdrop-blur-sm text-slate-100 text-sm font-medium px-6 py-2.5 rounded-full border border-white/20">
                Connect with expert tutors
              </span>
            </div>
            
            <h1 className="text-5xl md:text-7xl font-bold mb-8 leading-tight text-white">
              Find Your Perfect Tutor
            </h1>
            
            <p className="text-xl md:text-2xl mb-10 max-w-2xl mx-auto text-slate-300 leading-relaxed">
              Connect with qualified tutors and accelerate your learning journey with personalized guidance.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
              <Link
                href="/search"
                className="group bg-white text-slate-900 px-8 py-4 rounded-lg font-semibold text-base hover:bg-slate-50 transition-all duration-200 shadow-lg hover:shadow-xl flex items-center justify-center gap-2"
              >
                <span>Browse Tutors</span>
                <svg className="w-5 h-5 group-hover:translate-x-0.5 transition-transform" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </Link>
              <AITwinButton />
            </div>
            
            <div className="flex items-center justify-center gap-12 text-slate-400 text-sm">
              <div className="text-center">
                <div className="text-3xl font-bold text-white mb-1">1000+</div>
                <div>Expert Tutors</div>
              </div>
              <div className="w-px h-12 bg-slate-700"></div>
              <div className="text-center">
                <div className="text-3xl font-bold text-white mb-1">50+</div>
                <div>Subjects</div>
              </div>
              <div className="w-px h-12 bg-slate-700"></div>
              <div className="text-center">
                <div className="text-3xl font-bold text-white mb-1">4.9</div>
                <div>Average Rating</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 bg-white">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-4 text-slate-900">
              Why Choose Tutorly?
            </h2>
            <p className="text-lg text-slate-600 max-w-2xl mx-auto">
              Experience quality learning with features designed for your success
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            <div className="group relative bg-white p-8 rounded-xl hover:shadow-lg transition-all duration-200 border border-slate-200">
              <div className="w-12 h-12 bg-slate-900 rounded-lg flex items-center justify-center mb-6">
                <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-3 text-slate-900">Verified Tutors</h3>
              <p className="text-slate-600 leading-relaxed text-sm">
                Every tutor undergoes rigorous verification including background checks, 
                skill assessments, and student feedback validation.
              </p>
            </div>
            
            <div className="group relative bg-white p-8 rounded-xl hover:shadow-lg transition-all duration-200 border border-slate-200">
              <div className="w-12 h-12 bg-slate-900 rounded-lg flex items-center justify-center mb-6">
                <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-3 text-slate-900">Flexible Learning</h3>
              <p className="text-slate-600 leading-relaxed text-sm">
                Learn on your schedule with 24/7 availability, instant booking, 
                and seamless rescheduling for maximum convenience.
              </p>
            </div>
            
            <div className="group relative bg-white p-8 rounded-xl hover:shadow-lg transition-all duration-200 border border-slate-200">
              <div className="w-12 h-12 bg-slate-900 rounded-lg flex items-center justify-center mb-6">
                <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M8.433 7.418c.155-.103.346-.196.567-.267v1.698a2.305 2.305 0 01-.567-.267C8.07 8.34 8 8.114 8 8c0-.114.07-.34.433-.582zM11 12.849v-1.698c.22.071.412.164.567.267.364.243.433.468.433.582 0 .114-.07.34-.433.582a2.305 2.305 0 01-.567.267z" />
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-13a1 1 0 10-2 0v.092a4.535 4.535 0 00-1.676.662C6.602 6.234 6 7.009 6 8c0 .99.602 1.765 1.324 2.246.48.32 1.054.545 1.676.662v1.941c-.391-.127-.68-.317-.843-.504a1 1 0 10-1.51 1.31c.562.649 1.413 1.076 2.353 1.253V15a1 1 0 102 0v-.092a4.535 4.535 0 001.676-.662C13.398 13.766 14 12.991 14 12c0-.99-.602-1.765-1.324-2.246A4.535 4.535 0 0011 9.092V7.151c.391.127.68.317.843.504a1 1 0 101.511-1.31c-.563-.649-1.413-1.076-2.354-1.253V5z" clipRule="evenodd" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-3 text-slate-900">Smart Pricing</h3>
              <p className="text-slate-600 leading-relaxed text-sm">
                Transparent, competitive rates with no hidden fees. 
                Find quality education that fits any budget.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="py-24 bg-gray-50">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4 text-slate-900">
              How It Works
            </h2>
            <p className="text-lg text-slate-600 max-w-2xl mx-auto">
              Get started in just 4 simple steps
            </p>
          </div>
          
          <div className="grid md:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-slate-900 rounded-lg flex items-center justify-center mx-auto mb-6">
                <span className="text-2xl font-semibold text-white">1</span>
              </div>
              <h3 className="text-lg font-semibold mb-2 text-slate-900">Search</h3>
              <p className="text-slate-600 leading-relaxed text-sm">
                Find tutors based on subject, location, and availability
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-slate-900 rounded-lg flex items-center justify-center mx-auto mb-6">
                <span className="text-2xl font-semibold text-white">2</span>
              </div>
              <h3 className="text-lg font-semibold mb-2 text-slate-900">Connect</h3>
              <p className="text-slate-600 leading-relaxed text-sm">
                Message tutors and discuss your learning goals
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-slate-900 rounded-lg flex items-center justify-center mx-auto mb-6">
                <span className="text-2xl font-semibold text-white">3</span>
              </div>
              <h3 className="text-lg font-semibold mb-2 text-slate-900">Book</h3>
              <p className="text-slate-600 leading-relaxed text-sm">
                Schedule sessions and make secure payments
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-slate-900 rounded-lg flex items-center justify-center mx-auto mb-6">
                <span className="text-2xl font-semibold text-white">4</span>
              </div>
              <h3 className="text-lg font-semibold mb-2 text-slate-900">Learn</h3>
              <p className="text-slate-600 leading-relaxed text-sm">
                Start your learning journey with your chosen tutor
              </p>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
