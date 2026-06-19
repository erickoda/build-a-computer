import ToggleTheme from "@/src/components/toggleTheme";

const Layout = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="flex flex-col justify-center items-center w-full min-h-screen p-4 bg-background">
      <div className="flex flex-col space-y-6 w-fit p-8 border border-default-200 rounded-2xl shadow-xl">
        <ToggleTheme />
        {children}
      </div>
    </div>
  )
}

export default Layout;
