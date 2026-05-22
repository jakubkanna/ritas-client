import { ProfileSchema } from "@jakubkanna/labguy-front-schema";
import { useFetchData } from "../../hooks/useFetch";
import { Link } from "react-router-dom";
import { ArrowUpRight } from "react-bootstrap-icons";
import SectionModal from "../SectionModal";
import Bio from "../../pages/single/Bio";
import HTMLReactParser from "html-react-parser/lib/index";

export default function BioSec() {
  const { data } = useFetchData<ProfileSchema>("pages/about");

  if (!data) return null;

  const { statement } = data;

  const textStatement = statement ? HTMLReactParser(statement) : "";

  return (
    <div>
      <SectionModal path="#bio">
        <Bio data={data} />
      </SectionModal>
      <div id="Statement" className="text-center fs-2 ">
        <p className="truncate-text">{textStatement}</p>
        <Link to={"#bio"} className="fs-4 mt-5">
          Read more <ArrowUpRight />
        </Link>
      </div>
    </div>
  );
}
