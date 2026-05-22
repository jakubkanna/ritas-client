import { ProfileSchema } from "@jakubkanna/labguy-front-schema";
import { Col, Container, Row } from "react-bootstrap";
import { useFetchData } from "../../hooks/useFetch";
import HTMLReactParser from "html-react-parser/lib/index";

export default function ContactSec() {
  const { data } = useFetchData<ProfileSchema>("pages/contact");

  if (!data) return null;

  const { statement } = data;

  return (
    <Container className="fs-1 d-flex flex-column align-items-center">
      <Row>
        <Col>{statement && HTMLReactParser(statement)}</Col>
      </Row>
    </Container>
  );
}
