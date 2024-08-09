import { SignIn } from "@clerk/clerk-react";

const SignInPage = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        <SignIn
          path="/sign-in"
          routing="path"
          signUpUrl="/sign-up"
          appearance={{
            layout: {
              socialButtonsVariant: 'iconButton',
              socialButtonsPlacement: 'bottom',
            },
            elements: {
              rootBox: 'mx-auto mt-8',
              card: 'bg-indigo-100 shadow-md rounded-lg p-8',
              formFieldInput: 'w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500',
              formButtonPrimary: 'w-full py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500',
              footer: 'mt-6 text-center',
              footerAction: 'mt-2 text-sm rounded bg-indigo-100',
              footerActionLink: 'text-indigo-600 hover:text-indigo-500 font-medium',
              
              // Styling social buttons independently
              socialButtonsIconButton: 'border border-gray-300 hover:border-gray-400 p-2 rounded-full',
              socialButtonsBlockButton: 'w-full mb-2 p-2 border border-gray-300 rounded-md flex justify-center items-center',
              socialButtonsProviderIcon: 'w-5 h-5',
              // Individual social button styles
              'socialButtonsIconButton__google': 'hover:bg-red-300 bg-red-200',
              'socialButtonsIconButton__github': 'hover:bg-purple-400 bg-purple-300',
              // You can add more providers as needed
            },
          }}
        />
      </div>
    </div>
  );
};

export default SignInPage;
