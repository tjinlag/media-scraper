import { Textarea } from "@/components/ui/textarea";
import { Field, FieldContent, FieldLabel } from "@/components/ui/field";
import { Button } from "@/components/ui/button";

function App() {
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
          <Textarea placeholder="Enter each URL on a new line..." rows={10} />
        </FieldContent>
      </Field>

      <Button>Scrape</Button>
    </div>
  );
}

export default App;
