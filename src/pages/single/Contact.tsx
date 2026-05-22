import { ProfileSchema } from "@jakubkanna/labguy-front-schema";
import { Col, Container, Row } from "react-bootstrap";
import Layout from "../../components/layout/Layout";
import { useFetchData } from "../../hooks/useFetch";
import HTMLReactParser from "html-react-parser/lib/index";

export default function Contact() {
  const { data } = useFetchData<ProfileSchema>("pages/contact");

  if (!data) return null;

  const { statement } = data;

  return (
    <Layout title="Contact">
      <Container>
        <Row>
          <Col>{statement && HTMLReactParser(statement)}</Col>
        </Row>
      </Container>
    </Layout>
  );
}
