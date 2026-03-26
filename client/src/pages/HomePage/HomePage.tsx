import axios from "axios";
import { useState } from "react";
import { useNavigate } from "react-router";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Field, FieldContent, FieldLabel } from "@/components/ui/field";
import { Textarea } from "@/components/ui/textarea";
import type { ScrapeBatchResponse } from "@/types";
import { getAllValidUrls } from "@/utils";

function HomePage() {
  const navigate = useNavigate();

  const [inputValue, setInputValue] = useState("");

  function handleInputChange(e: React.ChangeEvent<HTMLTextAreaElement>) {
    setInputValue(e.target.value);
  }

  async function handleSubmit() {
    try {
      const urls = getAllValidUrls(inputValue);

      const response = await axios.post<ScrapeBatchResponse>(
        "http://localhost:3000/api/scrape",
        {
          urls,
        },
      );

      toast.success("Register to scrape your urls successfully");
      console.log(response.data);

      const scrapBatchId = response.data.data.scrapeBatchId;
      navigate(`/scrape/${scrapBatchId}`);
    } catch (err) {
      toast.error("Failed to scrape. Please try again later");
      console.log("[ERROR] Failed to scrape", err);
    }
  }

  return (
    <div className="p-8 flex flex-col gap-4">
      <h1>Media Scraper</h1>

      <p>
        <b>The Media Scraper</b> automatically collects media content such as
        images, videos from your provided URLs.
      </p>

      <Field>
        <FieldLabel>Your URLs</FieldLabel>
        <FieldContent>
          <Textarea
            placeholder="Enter each URL on a new line..."
            rows={10}
            value={inputValue}
            onChange={handleInputChange}
          />
        </FieldContent>
      </Field>

      <Button disabled={!inputValue} onClick={handleSubmit}>
        Scrape
      </Button>
    </div>
  );
}

export default HomePage;
