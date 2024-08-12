import React from 'react';

const TermsOfService: React.FC = () => {
    const currentYear = new Date().getFullYear();
    const lastUpdated = "August 12, 2024";

    return (
        <div className="bg-gray-50 min-h-screen">
            <div className="container mx-auto px-4 py-12 mt-24 max-w-4xl">
                <h1 className="text-4xl font-bold mb-8 text-center text-gray-800">Terms of Service</h1>
                
                <div className="bg-white shadow-md rounded-lg p-8">
                    <p className="text-sm text-gray-600 mb-6">Last updated: {lastUpdated}</p>
                    
                    <p className="mb-6 text-gray-700 leading-relaxed">Welcome to Belly Clock. Please read these Terms of Service ("Terms", "Terms of Service") carefully before using the Belly Clock website and fasting calculator service (the "Service") operated by Belly Clock ("us", "we", or "our").</p>
                    
                    {[
                        { title: "1. Acceptance of Terms", content: "By accessing or using the Service, you agree to be bound by these Terms. If you disagree with any part of the terms, then you may not access the Service." },
                        { title: "2. Description of Service", content: `Belly Clock provides a fasting calculator and related services to assist users in their intermittent fasting journey. The Service is provided "as is" and "as available" without any warranties of any kind.` },
                        { title: "3. User Accounts", content: "When you create an account with us, you must provide accurate, complete, and up-to-date information. Failure to do so may result in inaccurate results and faulty personalized services due to misinformation." },
                        { title: "4. User Responsibilities", content: "You are responsible for:", list: [
                            "Maintaining the confidentiality of your account and password",
                            "Restricting access to your computer or mobile device",
                            "Assuming responsibility for all activities that occur under your account"
                        ]},
                        { title: "5. Prohibited Uses", content: "You agree not to use the Service:", list: [
                            "For any unlawful purpose or to solicit others to perform or participate in any unlawful acts",
                            "To violate any international, federal, provincial or state regulations, rules, laws, or local ordinances",
                            "To infringe upon or violate our intellectual property rights or the intellectual property rights of others",
                            "To harass, abuse, insult, harm, defame, slander, disparage, intimidate, or discriminate",
                            "To submit false or misleading information"
                        ]},
                        { title: "6. Disclaimer", content: "The information provided by Belly Clock is for general informational purposes only. All information on the Service is provided in good faith, however we make no representation or warranty of any kind, express or implied, regarding the accuracy, adequacy, validity, reliability, availability or completeness of any information on the Service." },
                        { title: "7. Limitation of Liability", content: "In no event shall Belly Clock, nor its directors, employees, partners, agents, suppliers, or affiliates, be liable for any indirect, incidental, special, consequential or punitive damages, including without limitation, loss of profits, data, use, goodwill, or other intangible losses, resulting from your access to or use of or inability to access or use the Service." },
                        { title: "8. Termination", content: "We may terminate or suspend your account immediately, without prior notice or liability, for any reason whatsoever, including without limitation if you breach the Terms. Upon termination, your right to use the Service will immediately cease." },
                        { title: "9. Changes to Terms", content: "We reserve the right, at our sole discretion, to modify or replace these Terms at any time. If a revision is material we will try to provide at least 30 days' notice prior to any new terms taking effect." },
                        { title: "10. Contact Us", content: "If you have any questions about these Terms, please contact us at:", contact: [
                            "Belly Clock",
                            "Email: motlalepulasello5@gmail.com"
                        ]}
                    ].map((section, index) => (
                        <div key={index} className="mb-8">
                            <h2 className="text-2xl font-semibold mb-4 text-gray-800">{section.title}</h2>
                            <p className="mb-4 text-gray-700 leading-relaxed">{section.content}</p>
                            {section.list && (
                                <ul className="list-disc list-inside mb-4 text-gray-700">
                                    {section.list.map((item, i) => (
                                        <li key={i} className="mb-2">{item}</li>
                                    ))}
                                </ul>
                            )}
                            {section.contact && (
                                <div className="text-gray-700">
                                    {section.contact.map((line, i) => (
                                        <p key={i}>{line}</p>
                                    ))}
                                </div>
                            )}
                        </div>
                    ))}
                </div>
                
                <p className="mt-8 text-sm text-center text-gray-600">
                    &copy; {currentYear} Belly Clock - Free Fasting Calculator. All rights reserved.
                </p>
            </div>
        </div>
    );
};

export default TermsOfService;
