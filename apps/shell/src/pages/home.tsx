import { Link } from "react-router-dom";

import { Button } from "@ldc/ui/components/button";

const HomePage = () => {
  return (
    <div>
      <h1>Home Page</h1>
      <Link to="/dashboard">
        <Button variant="outline" size="sm">
          Dashboard
        </Button>
      </Link>
    </div>
  );
};

export default HomePage;
