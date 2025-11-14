import { Link } from 'react-router-dom';

export function PrivacyPage() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="container mx-auto px-4 py-4">
          <Link to="/" className="inline-flex items-center text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors">
            <svg className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back to SubtitleShift
          </Link>
        </div>
      </header>

      {/* Content */}
      <main className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8 sm:p-12">
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white mb-4">
            Privacy Policy
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-8">
            Last Updated: January 13, 2025
          </p>

          <div className="prose prose-gray dark:prose-invert max-w-none">
            {/* Introduction */}
            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">1. Introduction</h2>
              <p className="text-gray-700 dark:text-gray-300 mb-4">
                SubtitleShift ("we," "us," or "our") is committed to protecting your privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our subtitle editing web application at subtitleshift.com (the "Service").
              </p>
              <p className="text-gray-700 dark:text-gray-300 mb-4">
                Please read this Privacy Policy carefully. By using the Service, you consent to the practices described in this Privacy Policy.
              </p>
            </section>

            {/* Privacy-First Approach */}
            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">2. Our Privacy-First Approach</h2>
              <p className="text-gray-700 dark:text-gray-300 mb-4">
                SubtitleShift is designed with privacy as a core principle:
              </p>
              <div className="bg-green-50 dark:bg-green-900/20 border-l-4 border-green-500 p-4 mb-4">
                <ul className="list-disc list-inside text-gray-700 dark:text-gray-300 space-y-2">
                  <li><strong>100% Client-Side Processing:</strong> All subtitle editing happens in your browser</li>
                  <li><strong>No File Uploads:</strong> Your subtitle files and videos never leave your device</li>
                  <li><strong>No Cloud Storage:</strong> We do not store, access, or transmit your files</li>
                  <li><strong>Minimal Data Collection:</strong> We only collect what's necessary for the Service to function</li>
                </ul>
              </div>
            </section>

            {/* Information We Do NOT Collect */}
            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">3. Information We Do NOT Collect</h2>
              <p className="text-gray-700 dark:text-gray-300 mb-4">
                We want to be clear about what we do not collect:
              </p>
              <ul className="list-disc list-inside text-gray-700 dark:text-gray-300 mb-4 space-y-2">
                <li>We do not collect, upload, or store your subtitle files</li>
                <li>We do not collect, upload, or store your video files</li>
                <li>We do not access the content of your subtitle text</li>
                <li>We do not collect personally identifiable information unless you provide it (e.g., for support)</li>
                <li>We do not use cookies for tracking purposes</li>
              </ul>
            </section>

            {/* Information We Collect */}
            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">4. Information We Collect</h2>

              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">4.1 Analytics Data</h3>
              <p className="text-gray-700 dark:text-gray-300 mb-4">
                We use Google Analytics to understand how users interact with our Service. This includes:
              </p>
              <ul className="list-disc list-inside text-gray-700 dark:text-gray-300 mb-4 space-y-2">
                <li>Pages visited</li>
                <li>Features used (timestamp shift, video preview, etc.)</li>
                <li>Browser type and version</li>
                <li>Device type (desktop, mobile, tablet)</li>
                <li>Operating system</li>
                <li>Approximate location (country/region, not precise)</li>
                <li>Duration of visit</li>
                <li>Referral source (how you found us)</li>
              </ul>
              <p className="text-gray-700 dark:text-gray-300 mb-4">
                This data is anonymized and used only to improve the Service. You can opt out of Google Analytics by using browser extensions like uBlock Origin or Privacy Badger.
              </p>

              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">4.2 Local Storage Data</h3>
              <p className="text-gray-700 dark:text-gray-300 mb-4">
                We use your browser's localStorage to store:
              </p>
              <ul className="list-disc list-inside text-gray-700 dark:text-gray-300 mb-4 space-y-2">
                <li>Your Pro license key (if purchased)</li>
                <li>Your theme preference (dark mode/light mode)</li>
                <li>Auto-save data for your current editing session</li>
              </ul>
              <p className="text-gray-700 dark:text-gray-300 mb-4">
                This data is stored only on your device and is not transmitted to our servers. You can clear this data at any time through your browser settings.
              </p>

              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">4.3 Payment Information</h3>
              <p className="text-gray-700 dark:text-gray-300 mb-4">
                When you purchase SubtitleShift Pro, payment processing is handled entirely by Paddle.com Market Limited ("Paddle"), our Merchant of Record. Paddle collects:
              </p>
              <ul className="list-disc list-inside text-gray-700 dark:text-gray-300 mb-4 space-y-2">
                <li>Billing information (name, address, email)</li>
                <li>Payment information (credit card details)</li>
                <li>Transaction details (order number, purchase date, amount)</li>
              </ul>
              <p className="text-gray-700 dark:text-gray-300 mb-4">
                We do not have access to your payment information. Paddle's privacy practices are governed by their <a href="https://www.paddle.com/legal/privacy" target="_blank" rel="noopener noreferrer" className="text-primary-600 dark:text-primary-400 hover:underline">Privacy Policy</a>.
              </p>

              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">4.4 Support Communications</h3>
              <p className="text-gray-700 dark:text-gray-300 mb-4">
                If you contact us for support at info@subtitleshift.com, we collect:
              </p>
              <ul className="list-disc list-inside text-gray-700 dark:text-gray-300 mb-4 space-y-2">
                <li>Your email address</li>
                <li>The content of your message</li>
                <li>Any information you choose to provide (e.g., screenshots, error details)</li>
              </ul>
              <p className="text-gray-700 dark:text-gray-300 mb-4">
                We use this information solely to respond to your inquiry and improve our Service.
              </p>
            </section>

            {/* How We Use Your Information */}
            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">5. How We Use Your Information</h2>
              <p className="text-gray-700 dark:text-gray-300 mb-4">
                We use the limited information we collect for the following purposes:
              </p>
              <ul className="list-disc list-inside text-gray-700 dark:text-gray-300 mb-4 space-y-2">
                <li>To provide and maintain the Service</li>
                <li>To understand how users interact with the Service and identify areas for improvement</li>
                <li>To diagnose technical issues and improve performance</li>
                <li>To respond to support requests</li>
                <li>To detect and prevent fraud or abuse</li>
                <li>To comply with legal obligations</li>
              </ul>
              <p className="text-gray-700 dark:text-gray-300 mb-4">
                We do not sell, rent, or share your information with third parties for marketing purposes.
              </p>
            </section>

            {/* Third-Party Services */}
            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">6. Third-Party Services</h2>
              <p className="text-gray-700 dark:text-gray-300 mb-4">
                We use the following third-party services:
              </p>

              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">6.1 Google Analytics</h3>
              <p className="text-gray-700 dark:text-gray-300 mb-4">
                We use Google Analytics to analyze website traffic and usage patterns. Google Analytics may use cookies and collect data about your use of the Service. For more information, see <a href="https://policies.google.com/privacy" target="_blank" rel="noopener noreferrer" className="text-primary-600 dark:text-primary-400 hover:underline">Google's Privacy Policy</a>.
              </p>

              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">6.2 Paddle (Payment Processor)</h3>
              <p className="text-gray-700 dark:text-gray-300 mb-4">
                Paddle.com Market Limited processes all payments and is our Merchant of Record. Paddle's use of your personal information is governed by their <a href="https://www.paddle.com/legal/privacy" target="_blank" rel="noopener noreferrer" className="text-primary-600 dark:text-primary-400 hover:underline">Privacy Policy</a>.
              </p>

              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">6.3 Vercel (Hosting)</h3>
              <p className="text-gray-700 dark:text-gray-300 mb-4">
                Our Service is hosted on Vercel. Vercel may collect technical information such as IP addresses and access logs for security and performance purposes. See <a href="https://vercel.com/legal/privacy-policy" target="_blank" rel="noopener noreferrer" className="text-primary-600 dark:text-primary-400 hover:underline">Vercel's Privacy Policy</a>.
              </p>
            </section>

            {/* Data Security */}
            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">7. Data Security</h2>
              <p className="text-gray-700 dark:text-gray-300 mb-4">
                We take data security seriously:
              </p>
              <ul className="list-disc list-inside text-gray-700 dark:text-gray-300 mb-4 space-y-2">
                <li>All data transmission is encrypted using HTTPS/TLS</li>
                <li>We use industry-standard security practices to protect our infrastructure</li>
                <li>Access to any collected data is restricted to authorized personnel only</li>
                <li>We regularly review and update our security measures</li>
              </ul>
              <p className="text-gray-700 dark:text-gray-300 mb-4">
                However, no method of transmission over the Internet or electronic storage is 100% secure. While we strive to protect your information, we cannot guarantee absolute security.
              </p>
            </section>

            {/* Your Rights and Choices */}
            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">8. Your Rights and Choices</h2>
              <p className="text-gray-700 dark:text-gray-300 mb-4">
                You have the following rights regarding your information:
              </p>
              <ul className="list-disc list-inside text-gray-700 dark:text-gray-300 mb-4 space-y-2">
                <li><strong>Access:</strong> You can request information about the data we hold about you</li>
                <li><strong>Correction:</strong> You can request correction of inaccurate data</li>
                <li><strong>Deletion:</strong> You can request deletion of your data (except what we're legally required to retain)</li>
                <li><strong>Opt-Out:</strong> You can opt out of analytics tracking using browser extensions</li>
                <li><strong>Data Portability:</strong> You can request a copy of your data in a portable format</li>
              </ul>
              <p className="text-gray-700 dark:text-gray-300 mb-4">
                To exercise these rights, contact us at <a href="mailto:info@subtitleshift.com" className="text-primary-600 dark:text-primary-400 hover:underline">info@subtitleshift.com</a>.
              </p>
            </section>

            {/* Children's Privacy */}
            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">9. Children's Privacy</h2>
              <p className="text-gray-700 dark:text-gray-300 mb-4">
                Our Service is not directed to children under the age of 13. We do not knowingly collect personal information from children under 13. If you are a parent or guardian and believe your child has provided us with personal information, please contact us at info@subtitleshift.com, and we will delete such information.
              </p>
            </section>

            {/* International Users */}
            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">10. International Users</h2>
              <p className="text-gray-700 dark:text-gray-300 mb-4">
                If you are accessing the Service from outside the United States, please be aware that your information may be transferred to, stored, and processed in the United States or other countries where our service providers operate.
              </p>
              <p className="text-gray-700 dark:text-gray-300 mb-4">
                By using the Service, you consent to the transfer of your information to countries outside your country of residence, which may have different data protection rules.
              </p>
            </section>

            {/* Changes to Privacy Policy */}
            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">11. Changes to This Privacy Policy</h2>
              <p className="text-gray-700 dark:text-gray-300 mb-4">
                We may update this Privacy Policy from time to time. We will notify you of material changes by:
              </p>
              <ul className="list-disc list-inside text-gray-700 dark:text-gray-300 mb-4 space-y-2">
                <li>Updating the "Last Updated" date at the top of this page</li>
                <li>Posting a notice on our website</li>
                <li>Sending an email to registered users (if applicable)</li>
              </ul>
              <p className="text-gray-700 dark:text-gray-300 mb-4">
                Your continued use of the Service after changes become effective constitutes acceptance of the revised Privacy Policy.
              </p>
            </section>

            {/* Contact Information */}
            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">12. Contact Us</h2>
              <p className="text-gray-700 dark:text-gray-300 mb-4">
                If you have any questions about this Privacy Policy or our privacy practices, please contact us:
              </p>
              <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4">
                <p className="text-gray-700 dark:text-gray-300">
                  <strong>SubtitleShift</strong><br />
                  Email: <a href="mailto:info@subtitleshift.com" className="text-primary-600 dark:text-primary-400 hover:underline">info@subtitleshift.com</a><br />
                  Website: <a href="https://subtitleshift.com" className="text-primary-600 dark:text-primary-400 hover:underline">https://subtitleshift.com</a>
                </p>
              </div>
            </section>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 mt-12">
        <div className="container mx-auto px-4 py-6">
          <p className="text-center text-sm text-gray-500 dark:text-gray-400">
            © 2025 SubtitleShift. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
