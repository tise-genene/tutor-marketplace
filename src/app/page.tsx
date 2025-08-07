import Link from "next/link";

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-blue-600 via-blue-700 to-purple-700 text-white overflow-hidden min-h-[90vh] flex items-center">
        <div className="absolute inset-0 bg-black opacity-10"></div>
        <div className="absolute inset-0">
          <div className="absolute top-10 left-10 w-32 h-32 bg-white opacity-5 rounded-full blur-xl"></div>
          <div className="absolute bottom-20 right-20 w-48 h-48 bg-purple-300 opacity-10 rounded-full blur-2xl"></div>
          <div className="absolute top-1/2 left-1/4 w-24 h-24 bg-blue-300 opacity-8 rounded-full blur-lg"></div>
        </div>
        
        <div className="relative container mx-auto px-6 py-24">
          <div className="max-w-5xl mx-auto text-center">
            <div className="mb-8">
              <span className="inline-block bg-white bg-opacity-90 text-blue-700 text-sm font-bold px-6 py-3 rounded-full backdrop-blur-sm border border-white shadow-lg">
                🎓 Join 10,000+ Students Learning Daily
              </span>
            </div>
            
            <h1 className="text-6xl md:text-8xl font-extrabold mb-8 leading-none">
              Find Your Perfect
              <span className="block bg-gradient-to-r from-yellow-300 via-orange-300 to-pink-300 bg-clip-text text-transparent">
                Tutor
              </span>
            </h1>
            
            <p className="text-xl md:text-2xl mb-12 max-w-3xl mx-auto text-blue-100 leading-relaxed">
              Connect with world-class tutors for personalized learning. 
              Master any subject with expert guidance tailored just for you.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-6 justify-center mb-16">
              <Link 
                href="/search" 
                className="group bg-white text-blue-700 px-12 py-5 rounded-2xl font-bold text-lg hover:bg-gray-50 transition-all duration-300 shadow-2xl hover:shadow-xl hover:scale-105 flex items-center justify-center gap-3"
              >
                <span>Find a Tutor</span>
                <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </Link>
              
              <Link 
                href="/auth/register" 
                className="group border-2 border-white text-white px-12 py-5 rounded-2xl font-bold text-lg hover:bg-white hover:text-blue-700 transition-all duration-300 backdrop-blur-sm hover:scale-105 flex items-center justify-center gap-3"
              >
                <span>Become a Tutor</span>
                <svg className="w-5 h-5 group-hover:rotate-12 transition-transform" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
              </Link>
            </div>
            
            <div className="flex items-center justify-center gap-12 text-blue-200 text-lg">
              <div className="text-center">
                <div className="text-3xl font-bold text-white mb-1">1000+</div>
                <div className="text-sm">Expert Tutors</div>
              </div>
              <div className="w-px h-12 bg-blue-300 opacity-50"></div>
              <div className="text-center">
                <div className="text-3xl font-bold text-white mb-1">50+</div>
                <div className="text-sm">Subjects</div>
              </div>
              <div className="w-px h-12 bg-blue-300 opacity-50"></div>
              <div className="text-center">
                <div className="text-3xl font-bold text-white mb-1">4.9★</div>
                <div className="text-sm">Average Rating</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 bg-white">
        <div className="container mx-auto px-6">
          <div className="text-center mb-20">
            <h2 className="text-5xl font-bold mb-6 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Why Choose Our Platform?
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Experience the future of learning with our innovative features designed for success
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-10">
            <div className="group relative bg-gradient-to-br from-blue-50 to-indigo-100 p-8 rounded-3xl hover:shadow-2xl transition-all duration-300 hover:scale-105 border border-blue-200">
              <div className="absolute top-6 right-6 w-12 h-12 bg-blue-500 rounded-2xl flex items-center justify-center rotate-12 group-hover:rotate-0 transition-transform duration-300">
                <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold mb-4 text-gray-800">Verified Tutors</h3>
              <p className="text-gray-600 leading-relaxed">
                Every tutor undergoes rigorous verification including background checks, 
                skill assessments, and student feedback validation.
              </p>
            </div>
            
            <div className="group relative bg-gradient-to-br from-purple-50 to-pink-100 p-8 rounded-3xl hover:shadow-2xl transition-all duration-300 hover:scale-105 border border-purple-200">
              <div className="absolute top-6 right-6 w-12 h-12 bg-purple-500 rounded-2xl flex items-center justify-center rotate-12 group-hover:rotate-0 transition-transform duration-300">
                <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold mb-4 text-gray-800">Flexible Learning</h3>
              <p className="text-gray-600 leading-relaxed">
                Learn on your schedule with 24/7 availability, instant booking, 
                and seamless rescheduling for maximum convenience.
              </p>
            </div>
            
            <div className="group relative bg-gradient-to-br from-green-50 to-emerald-100 p-8 rounded-3xl hover:shadow-2xl transition-all duration-300 hover:scale-105 border border-green-200">
              <div className="absolute top-6 right-6 w-12 h-12 bg-green-500 rounded-2xl flex items-center justify-center rotate-12 group-hover:rotate-0 transition-transform duration-300">
                <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M8.433 7.418c.155-.103.346-.196.567-.267v1.698a2.305 2.305 0 01-.567-.267C8.07 8.34 8 8.114 8 8c0-.114.07-.34.433-.582zM11 12.849v-1.698c.22.071.412.164.567.267.364.243.433.468.433.582 0 .114-.07.34-.433.582a2.305 2.305 0 01-.567.267z" />
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-13a1 1 0 10-2 0v.092a4.535 4.535 0 00-1.676.662C6.602 6.234 6 7.009 6 8c0 .99.602 1.765 1.324 2.246.48.32 1.054.545 1.676.662v1.941c-.391-.127-.68-.317-.843-.504a1 1 0 10-1.51 1.31c.562.649 1.413 1.076 2.353 1.253V15a1 1 0 102 0v-.092a4.535 4.535 0 001.676-.662C13.398 13.766 14 12.991 14 12c0-.99-.602-1.765-1.324-2.246A4.535 4.535 0 0011 9.092V7.151c.391.127.68.317.843.504a1 1 0 101.511-1.31c-.563-.649-1.413-1.076-2.354-1.253V5z" clipRule="evenodd" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold mb-4 text-gray-800">Smart Pricing</h3>
              <p className="text-gray-600 leading-relaxed">
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
            <h2 className="text-4xl font-bold mb-4 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              How It Works
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Get started in just 4 simple steps
            </p>
          </div>
          
          <div className="grid md:grid-cols-4 gap-8">
            <div className="text-center group">
              <div className="bg-gradient-to-br from-blue-500 to-blue-600 w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300 shadow-lg">
                <span className="text-2xl font-bold text-white">1</span>
              </div>
              <h3 className="text-xl font-bold mb-3 text-gray-800">Search</h3>
              <p className="text-gray-600 leading-relaxed">
                Find tutors based on subject, location, and availability
              </p>
            </div>
            
            <div className="text-center group">
              <div className="bg-gradient-to-br from-purple-500 to-purple-600 w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300 shadow-lg">
                <span className="text-2xl font-bold text-white">2</span>
              </div>
              <h3 className="text-xl font-bold mb-3 text-gray-800">Connect</h3>
              <p className="text-gray-600 leading-relaxed">
                Message tutors and discuss your learning goals
              </p>
            </div>
            
            <div className="text-center group">
              <div className="bg-gradient-to-br from-green-500 to-green-600 w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300 shadow-lg">
                <span className="text-2xl font-bold text-white">3</span>
              </div>
              <h3 className="text-xl font-bold mb-3 text-gray-800">Book</h3>
              <p className="text-gray-600 leading-relaxed">
                Schedule sessions and make secure payments
              </p>
            </div>
            
            <div className="text-center group">
              <div className="bg-gradient-to-br from-orange-500 to-orange-600 w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300 shadow-lg">
                <span className="text-2xl font-bold text-white">4</span>
              </div>
              <h3 className="text-xl font-bold mb-3 text-gray-800">Learn</h3>
              <p className="text-gray-600 leading-relaxed">
                Start your learning journey with your chosen tutor
              </p>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
