export default function SingleCardPage(props: {
  children: JSX.Element;
  header: string;
  helpText?: string;
}) {
  return (
    <div className="flex min-h-full flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <img
          className="mx-auto h-12 w-auto"
          src="https://tailwindui.com/img/logos/mark.svg?color=indigo&shade=600"
          alt="Your Company"
        />
        <h2 className="mt-6 text-center text-3xl font-bold tracking-tight text-gray-900 dark:text-white">
          {props.header}
        </h2>
        {props.helpText !== undefined && (
          <p className="mt-2 text-center text-sm text-gray-600 dark:text-gray-300">
            {props.header}
          </p>
        )}
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white dark:bg-slate-700 dark:border dark:border-slate-500 py-8 px-4 shadow sm:rounded-lg sm:px-10">
          {props.children}
        </div>
      </div>
    </div>
  );
}
