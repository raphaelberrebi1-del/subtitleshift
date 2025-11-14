import { Link } from 'react-router-dom';

export function TermsPage() {
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
            Terms of Service
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-8">
            Last Updated: January 13, 2025
          </p>

          <div className="prose prose-gray dark:prose-invert max-w-none">
            {/* Introduction */}
            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">1. Introduction</h2>
              <p className="text-gray-700 dark:text-gray-300 mb-4">
                Welcome to SubtitleShift ("we," "our," or "us"). By accessing or using our subtitle editing web application at subtitleshift.com (the "Service"), you agree to be bound by these Terms of Service ("Terms"). If you do not agree to these Terms, please do not use the Service.
              </p>
              <p className="text-gray-700 dark:text-gray-300 mb-4">
                SubtitleShift is a browser-based subtitle editor that allows users to edit SRT subtitle files, adjust timestamps, and preview subtitles with video - all processed locally in your browser.
              </p>
            </section>

            {/* Service Description */}
            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">2. Service Description</h2>
              <p className="text-gray-700 dark:text-gray-300 mb-4">
                SubtitleShift provides the following features:
              </p>
              <ul className="list-disc list-inside text-gray-700 dark:text-gray-300 mb-4 space-y-2">
                <li>SRT subtitle file parsing and editing</li>
                <li>Timestamp adjustment tools</li>
                <li>Text editing capabilities</li>
                <li>Find and replace functionality (Pro)</li>
                <li>Video preview with subtitle overlay (Pro)</li>
                <li>Batch processing (Pro)</li>
                <li>Export to SRT format</li>
              </ul>
              <p className="text-gray-700 dark:text-gray-300 mb-4">
                All file processing is performed client-side in your browser. We do not upload, store, or access your subtitle files or videos on our servers.
              </p>
            </section>

            {/* Pricing and Payment */}
            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">3. Pricing and Payment</h2>

              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">3.1 Free Tier</h3>
              <p className="text-gray-700 dark:text-gray-300 mb-4">
                The basic version of SubtitleShift is available for free with the following limitations:
              </p>
              <ul className="list-disc list-inside text-gray-700 dark:text-gray-300 mb-4 space-y-2">
                <li>Up to 50 subtitles per file</li>
                <li>Basic timestamp shifting</li>
                <li>Text editing</li>
                <li>No video preview</li>
                <li>No batch processing</li>
                <li>No find and replace</li>
              </ul>

              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">3.2 Pro Version</h3>
              <p className="text-gray-700 dark:text-gray-300 mb-4">
                SubtitleShift Pro is available for a one-time payment of <strong>$4.99 USD</strong> and includes:
              </p>
              <ul className="list-disc list-inside text-gray-700 dark:text-gray-300 mb-4 space-y-2">
                <li>Unlimited subtitles</li>
                <li>Video preview with subtitle sync</li>
                <li>Advanced find and replace</li>
                <li>Inline text editing</li>
                <li>Batch processing</li>
                <li>All future updates</li>
                <li>Priority support</li>
              </ul>

              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">3.3 Payment Processing</h3>
              <p className="text-gray-700 dark:text-gray-300 mb-4">
                Payments are processed securely through Paddle.com Market Limited ("Paddle"), our Merchant of Record. By making a purchase, you agree to Paddle's Terms of Service and Privacy Policy. We do not store or have access to your payment information.
              </p>

              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">3.4 License Key</h3>
              <p className="text-gray-700 dark:text-gray-300 mb-4">
                Upon successful payment, you will receive a license key that unlocks Pro features. The license key is for your personal use and may be used on multiple devices, but you may not share or resell the license key.
              </p>
            </section>

            {/* Refund Policy */}
            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">4. Refund Policy</h2>
              <p className="text-gray-700 dark:text-gray-300 mb-4">
                We offer a <strong>30-day money-back guarantee</strong>. If you are not satisfied with SubtitleShift Pro for any reason, you may request a full refund within 30 days of purchase.
              </p>
              <p className="text-gray-700 dark:text-gray-300 mb-4">
                To request a refund, contact us at <a href="mailto:info@subtitleshift.com" className="text-primary-600 dark:text-primary-400 hover:underline">info@subtitleshift.com</a> with your order number or license key. Refunds are processed within 5-7 business days.
              </p>
            </section>

            {/* User Conduct */}
            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">5. User Conduct</h2>
              <p className="text-gray-700 dark:text-gray-300 mb-4">
                You agree to use the Service only for lawful purposes and in accordance with these Terms. You agree not to:
              </p>
              <ul className="list-disc list-inside text-gray-700 dark:text-gray-300 mb-4 space-y-2">
                <li>Use the Service in any way that violates applicable laws or regulations</li>
                <li>Attempt to reverse engineer, decompile, or disassemble the Service</li>
                <li>Use automated systems to access or interact with the Service without authorization</li>
                <li>Share or resell license keys</li>
                <li>Use the Service to process illegal or harmful content</li>
                <li>Attempt to circumvent security features or payment systems</li>
              </ul>
            </section>

            {/* Privacy and Data */}
            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">6. Privacy and Data Processing</h2>
              <p className="text-gray-700 dark:text-gray-300 mb-4">
                Your privacy is important to us. SubtitleShift operates entirely client-side:
              </p>
              <ul className="list-disc list-inside text-gray-700 dark:text-gray-300 mb-4 space-y-2">
                <li>We do not upload your subtitle files or videos to our servers</li>
                <li>All file processing happens locally in your browser</li>
                <li>We use localStorage to store your license key and preferences on your device</li>
                <li>We collect anonymous analytics data (page views, feature usage) via Google Analytics</li>
                <li>Payment information is handled exclusively by Paddle and is never transmitted to us</li>
              </ul>
              <p className="text-gray-700 dark:text-gray-300 mb-4">
                For more information, please see our <Link to="/privacy" className="text-primary-600 dark:text-primary-400 hover:underline">Privacy Policy</Link>.
              </p>
            </section>

            {/* Intellectual Property */}
            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">7. Intellectual Property</h2>
              <p className="text-gray-700 dark:text-gray-300 mb-4">
                SubtitleShift and all related content, features, and functionality are owned by us and are protected by international copyright, trademark, and other intellectual property laws.
              </p>
              <p className="text-gray-700 dark:text-gray-300 mb-4">
                You retain all rights to the subtitle files and videos you process using our Service. We claim no ownership over your content.
              </p>
            </section>

            {/* Disclaimer of Warranties */}
            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">8. Disclaimer of Warranties</h2>
              <p className="text-gray-700 dark:text-gray-300 mb-4">
                THE SERVICE IS PROVIDED "AS IS" AND "AS AVAILABLE" WITHOUT WARRANTIES OF ANY KIND, EITHER EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO IMPLIED WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE, OR NON-INFRINGEMENT.
              </p>
              <p className="text-gray-700 dark:text-gray-300 mb-4">
                We do not warrant that:
              </p>
              <ul className="list-disc list-inside text-gray-700 dark:text-gray-300 mb-4 space-y-2">
                <li>The Service will be uninterrupted, secure, or error-free</li>
                <li>The results obtained from using the Service will be accurate or reliable</li>
                <li>Any errors in the Service will be corrected</li>
              </ul>
            </section>

            {/* Limitation of Liability */}
            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">9. Limitation of Liability</h2>
              <p className="text-gray-700 dark:text-gray-300 mb-4">
                TO THE MAXIMUM EXTENT PERMITTED BY LAW, IN NO EVENT SHALL SUBTITLESHIFT, ITS AFFILIATES, OR THEIR RESPECTIVE OFFICERS, DIRECTORS, EMPLOYEES, OR AGENTS BE LIABLE FOR ANY INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES, INCLUDING BUT NOT LIMITED TO LOSS OF PROFITS, DATA, USE, OR GOODWILL, ARISING OUT OF OR RELATED TO YOUR USE OF THE SERVICE.
              </p>
              <p className="text-gray-700 dark:text-gray-300 mb-4">
                OUR TOTAL LIABILITY TO YOU FOR ANY CLAIMS ARISING OUT OF OR RELATED TO THESE TERMS OR THE SERVICE SHALL NOT EXCEED THE AMOUNT YOU PAID US IN THE 12 MONTHS PRECEDING THE CLAIM (UP TO $4.99).
              </p>
            </section>

            {/* Changes to Service */}
            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">10. Changes to Service and Terms</h2>
              <p className="text-gray-700 dark:text-gray-300 mb-4">
                We reserve the right to modify, suspend, or discontinue the Service (or any part thereof) at any time, with or without notice. We will not be liable to you or any third party for any modification, suspension, or discontinuation of the Service.
              </p>
              <p className="text-gray-700 dark:text-gray-300 mb-4">
                We may update these Terms from time to time. We will notify you of material changes by posting the new Terms on this page and updating the "Last Updated" date. Your continued use of the Service after changes become effective constitutes acceptance of the revised Terms.
              </p>
            </section>

            {/* Termination */}
            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">11. Termination</h2>
              <p className="text-gray-700 dark:text-gray-300 mb-4">
                You may stop using the Service at any time. We may terminate or suspend your access to the Service immediately, without prior notice, if you breach these Terms.
              </p>
              <p className="text-gray-700 dark:text-gray-300 mb-4">
                Upon termination, your right to use the Service will immediately cease. If you purchased a Pro license, termination does not affect your license rights unless the termination is due to your breach of these Terms.
              </p>
            </section>

            {/* Governing Law */}
            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">12. Governing Law and Dispute Resolution</h2>
              <p className="text-gray-700 dark:text-gray-300 mb-4">
                These Terms shall be governed by and construed in accordance with the laws of the jurisdiction in which we operate, without regard to its conflict of law provisions.
              </p>
              <p className="text-gray-700 dark:text-gray-300 mb-4">
                Any disputes arising out of or related to these Terms or the Service shall be resolved through binding arbitration, except that either party may seek injunctive relief in court for infringement of intellectual property rights.
              </p>
            </section>

            {/* Contact Information */}
            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">13. Contact Information</h2>
              <p className="text-gray-700 dark:text-gray-300 mb-4">
                If you have any questions about these Terms of Service, please contact us:
              </p>
              <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4">
                <p className="text-gray-700 dark:text-gray-300">
                  <strong>SubtitleShift</strong><br />
                  Email: <a href="mailto:info@subtitleshift.com" className="text-primary-600 dark:text-primary-400 hover:underline">info@subtitleshift.com</a><br />
                  Website: <a href="https://subtitleshift.com" className="text-primary-600 dark:text-primary-400 hover:underline">https://subtitleshift.com</a>
                </p>
              </div>
            </section>

            {/* Entire Agreement */}
            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">14. Entire Agreement</h2>
              <p className="text-gray-700 dark:text-gray-300 mb-4">
                These Terms constitute the entire agreement between you and SubtitleShift regarding the Service and supersede all prior agreements and understandings, whether written or oral.
              </p>
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
