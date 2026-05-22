import { ReactNode, useContext } from "react";
import { Col, Fade, Row } from "react-bootstrap";
import { GeneralContext } from "../../contexts/GeneralContext";
import { Helmet } from "react-helmet";

import { ProfileSchema } from "@jakubkanna/labguy-front-schema";
import { SITE_OWNER_NAME } from "../../config/staticSite";

const DEFAULT_DESCRIPTION = "Rita Borralho Silva portfolio and works.";
const DEFAULT_META_IMAGE =
  "https://white-hawk-279904.hostingersite.com/alice/alice_10.jpg";

export default function Layout({
  children,
  title,
  description,
  footer,
  header,
}: {
  children: ReactNode;
  title?: string;
  description?: string;
  profile?: ProfileSchema;
  footer?: ReactNode;
  header?: ReactNode;
}) {
  const { preferences } = useContext(GeneralContext);
  const artistsName = preferences?.artists_name || SITE_OWNER_NAME;

  const metadata = {
    title: title || artistsName,
    description: description || DEFAULT_DESCRIPTION,
    name: artistsName,
  };

  return (
    <>
      {/* meta */}
      <Helmet>
        <title>{metadata.title}</title>
        <meta name="description" content={metadata.description} />
        <meta name="author" content={metadata.name} />
        <meta property="og:type" content="website" />
        <meta property="og:site_name" content={metadata.name} />
        <meta property="og:title" content={metadata.title} />
        <meta property="og:description" content={metadata.description} />
        <meta property="og:image" content={DEFAULT_META_IMAGE} />
        <meta property="og:image:secure_url" content={DEFAULT_META_IMAGE} />
        <meta property="og:image:type" content="image/jpeg" />
        <meta property="og:image:width" content="1508" />
        <meta property="og:image:height" content="1391" />
        <meta
          property="og:image:alt"
          content="Rita Borralho Silva 3D model preview"
        />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={metadata.title} />
        <meta name="twitter:description" content={metadata.description} />
        <meta name="twitter:image" content={DEFAULT_META_IMAGE} />
      </Helmet>
      <Fade in={true} appear={true}>
        <div>
          {/* Header */}
          {title && (
            <Row
              id="SinglePageHeader"
              className="py-4 z-1  d-flex justify-content-center text-center"
              style={{ marginBottom: "-1px" }}
            >
              {header || <h1 className="display-1 fw-normal mb-0">{title}</h1>}
            </Row>
          )}

          {/* Body */}
          <Row className="p-2 flex-grow-1">
            <Col xs={12}>
              <Row id="SinglePageContent" className="row flex-grow-1">
                {children}
              </Row>
            </Col>
          </Row>

          {/* Footer */}
          {footer && (
            <Col xs={12} id="SinglePageFooter">
              <Row>{footer}</Row>
            </Col>
          )}
        </div>
      </Fade>
    </>
  );
}
