export default function TutorResources() {
  return (
    <div className="max-w-4xl mx-auto py-8">
      <h1 className="text-3xl font-bold mb-6">Tutor Resources</h1>
      
      <div className="space-y-8">
        <section>
          <h2 className="text-2xl font-semibold mb-4">Getting Started</h2>
          <div className="prose max-w-none">
            <p className="text-gray-600 mb-4">
              Welcome to EthioTutor! Here are some resources to help you get started as a tutor.
            </p>
            <ul className="list-disc list-inside space-y-2 text-gray-600">
              <li>Create your detailed tutor profile</li>
              <li>Set your availability and hourly rates</li>
              <li>Upload your credentials and experience</li>
              <li>Start accepting student bookings</li>
            </ul>
          </div>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4">Teaching Guidelines</h2>
          <div className="prose max-w-none">
            <p className="text-gray-600 mb-4">
              Follow these best practices to provide excellent tutoring experiences:
            </p>
            <ul className="list-disc list-inside space-y-2 text-gray-600">
              <li>Prepare lesson plans in advance</li>
              <li>Communicate clearly with students</li>
              <li>Be punctual for scheduled sessions</li>
              <li>Provide constructive feedback</li>
            </ul>
          </div>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4">Support</h2>
          <p className="text-gray-600">
            Need help? Contact our support team or visit our FAQ section for common questions.
          </p>
        </section>
      </div>
    </div>
  );
}