import { useContext, useEffect } from "react";
import { Col } from "react-bootstrap";
import Layout from "../../components/layout/Layout";
import { GeneralContext } from "../../contexts/GeneralContext";
import Section from "../../components/sections/Section";
import WorksSecContent from "../../components/sections/Works.section";
import { Link, useLocation } from "react-router-dom";
import { ArrowUpRight } from "react-bootstrap-icons";
import ContactSec from "../../components/sections/Contact.section";
import BioSec from "../../components/sections/Bio.section";
import { Alice } from "../../components/Alice/Alice";

export default function Homepage() {
  const { preferences } = useContext(GeneralContext);
  const location = useLocation();

  useEffect(() => {
    // Scroll to the element with the ID from the fragment identifier
    if (location.hash) {
      const element = document.querySelector(location.hash);
      if (element) {
        element.scrollIntoView({ behavior: "smooth" });
      }
    }
  }, [location.hash]);

  if (!preferences) return null;
  return (
    <Layout>
      <Col>
        <Section id="home">
          <Alice />
        </Section>
        <div id="sections">
          <Section id="bio">
            <Section.Layout title="Bio" body={<BioSec />} />
          </Section>
          <Section id="works">
            <Section.Layout
              title="Works"
              subtitle={
                <Link to={"#works"}>
                  View full selection <ArrowUpRight />
                </Link>
              }
              body={<WorksSecContent />}
            />
          </Section>
          <Section id="contact">
            <Section.Layout title="Contact" body={<ContactSec />} />
          </Section>
        </div>
      </Col>
    </Layout>
  );
}
