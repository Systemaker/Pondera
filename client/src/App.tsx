import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import PonderaEditor from "@/pages/PonderaEditor";
import { NotesProvider } from "@/context/NotesContext";

function Router() {
  return (
    <Switch>
      <Route path="/" component={PonderaEditor}/>
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <NotesProvider>
          <Toaster />
          <Router />
        </NotesProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
