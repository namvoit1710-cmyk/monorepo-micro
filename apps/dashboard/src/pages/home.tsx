import { Link } from "react-router-dom";

import { Button } from "@ldc/ui/components/button";
import { env } from "@/env";

const HomePage = () => {
  return (
    <div>
      {env.PUBLIC_WORKFLOW_API_URL}
      <Link to="/">
        <Button variant={"default"}>Home</Button>
      </Link>
    </div>
  );
};

export default HomePage;
