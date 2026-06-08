interface Step {
  title: string;
  description?: string;
}

interface StepsProps {
  steps: Step[];
  currentStep: number;
}

export const Steps = ({ steps, currentStep }: StepsProps) => {
  return (
    <nav aria-label="Progress">
      <ol className="flex flex-col md:flex-row items-center w-full space-y-4 md:space-y-0 md:space-x-4">
        {steps.map((step, index) => {
          const isCompleted = index < currentStep;
          const isActive = index === currentStep;

          return (
            <li key={step.title} className="flex-1 w-full">
              <div
                className={`flex items-center font-medium pr-4 py-2 border-l-4 md:border-l-0 md:border-t-4 transition-colors duration-200 ${isCompleted || isActive
                  ? 'border-primary text-primary'
                  : 'border-default-200 text-default-500'
                  }`}
              >
                <span className="flex-shrink-0">
                  <span
                    className={`flex items-center justify-center w-8 h-8 rounded-full text-sm font-semibold transition-colors duration-200 ${isCompleted
                      ? 'bg-primary text-white'
                      : isActive
                        ? 'border-2 border-primary text-primary'
                        : 'border-2 border-default-200 text-default-400'
                      }`}
                  >
                    {isCompleted ? (
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    ) : (
                      String(index + 1).padStart(2, '0')
                    )}
                  </span>
                </span>

                <span className="ml-4 text-sm min-w-0">
                  <span className="font-semibold block truncate">{step.title}</span>
                  {step.description && (
                    <span className="text-xs opacity-70 truncate block">{step.description}</span>
                  )}
                </span>
              </div>
            </li>
          );
        })}
      </ol>
    </nav>
  );
};
