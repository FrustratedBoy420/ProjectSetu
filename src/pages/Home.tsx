import React from 'react';
import { Link } from 'react-router-dom';
import { Shield, Lock, Brain, Users, TrendingUp, CheckCircle, ArrowRight } from 'lucide-react';

const Home: React.FC = () => {
  const features = [
    {
      icon: <Lock className="h-8 w-8 text-blue-600" />,
      title: 'Triple-Lock Security',
      description: 'Every transaction requires vendor proof, AI verification, and beneficiary consent before fund release.'
    },
    {
      icon: <Brain className="h-8 w-8 text-purple-600" />,
      title: 'AI-Powered Verification',
      description: 'Advanced OCR and machine learning algorithms verify document authenticity and detect anomalies.'
    },
    {
      icon: <Shield className="h-8 w-8 text-green-600" />,
      title: 'Blockchain Transparency',
      description: 'All transactions are recorded on an immutable public ledger for complete transparency.'
    },
    {
      icon: <Users className="h-8 w-8 text-orange-600" />,
      title: 'Beneficiary Empowerment',
      description: 'Recipients have the final say in confirming they received the promised aid or services.'
    }
  ];

  const stats = [
    { value: '₹50M+', label: 'Funds Tracked' },
    { value: '10,000+', label: 'Lives Impacted' },
    { value: '95%', label: 'Transparency Score' },
    { value: '50+', label: 'Active Projects' }
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-blue-600 via-purple-600 to-green-600 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold mb-6">
              Transparent Social Funding
              <span className="block text-yellow-300">for Everyone</span>
            </h1>
            <p className="text-xl md:text-2xl text-blue-100 mb-8 max-w-3xl mx-auto">
              Project Setu brings accountability to social funding through blockchain technology, 
              AI verification, and community oversight. Every rupee tracked, every impact verified.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                to="/projects"
                className="bg-white text-blue-600 px-8 py-4 rounded-lg font-semibold text-lg hover:bg-gray-100 transition-colors inline-flex items-center"
              >
                Explore Projects
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
              <Link
                to="/register"
                className="border-2 border-white text-white px-8 py-4 rounded-lg font-semibold text-lg hover:bg-white hover:text-blue-600 transition-colors"
              >
                Join the Movement
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">{stat.value}</div>
                <div className="text-gray-600">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              How Project Setu Works
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Our revolutionary Triple-Lock system ensures every donation reaches its intended destination 
              with complete transparency and accountability.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <div key={index} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
                <div className="mb-4">{feature.icon}</div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">{feature.title}</h3>
                <p className="text-gray-600">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Triple-Lock Process */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              The Triple-Lock Process
            </h2>
            <p className="text-xl text-gray-600">
              Three layers of verification ensure your donations create real impact
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="bg-blue-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-blue-600">1</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Vendor Proof</h3>
              <p className="text-gray-600">
                Service providers submit geo-tagged, time-stamped photos of completed work or delivered goods.
              </p>
            </div>

            <div className="text-center">
              <div className="bg-purple-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-purple-600">2</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">AI Verification</h3>
              <p className="text-gray-600">
                Advanced AI analyzes documents, verifies authenticity, and checks against approved budgets.
              </p>
            </div>

            <div className="text-center">
              <div className="bg-green-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-green-600">3</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Beneficiary Consent</h3>
              <p className="text-gray-600">
                Recipients confirm they received the promised aid, acting as the final human verification.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-blue-600 to-purple-600 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Ready to Make a Transparent Impact?
          </h2>
          <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
            Join thousands of donors, NGOs, and beneficiaries who trust Project Setu 
            for transparent and accountable social funding.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/register"
              className="bg-white text-blue-600 px-8 py-4 rounded-lg font-semibold text-lg hover:bg-gray-100 transition-colors"
            >
              Get Started Today
            </Link>
            <Link
              to="/about"
              className="border-2 border-white text-white px-8 py-4 rounded-lg font-semibold text-lg hover:bg-white hover:text-blue-600 transition-colors"
            >
              Learn More
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;