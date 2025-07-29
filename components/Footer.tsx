import DarkModeToggle from "./DarkModeToggle";

export default function Footer() {
  return (
    <footer className="bg-background/80 backdrop-blur-sm border-t border-border py-4">
      <DarkModeToggle />
      <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
        &copy; {new Date().getFullYear()} Your Company Name. All rights
        reserved.
      </div>
    </footer>
  );
}
