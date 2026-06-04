import React, { useState } from "react";
import { Col, Row } from "react-bootstrap";
import { Work } from "../../types/Work";
import Thumbnail from "../components/Thumbnail"; // Import the Thumbnail component
import { Link } from "react-router-dom";
import styled, { keyframes } from "styled-components";
import { getRitasColor } from "../utils/helpers";

interface CardProps {
  work: Work;
  onClick?: () => void;
}

const pulseAnimation = keyframes`
  0% {
    background-size: 25px;
  }
  100% {
    background-size: 50px;
  }

`;

const Hover = styled.div<{ color: string }>`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1;
  background: repeating-radial-gradient(
    ${(props) => props.color},
    rgba(255, 255, 255, 0.75) 25px
  );
  background-size: 50px;
  background-position: center;
  animation: ${pulseAnimation} 2s ease-in-out;
  transition: opacity 0.3s ease;
  border-radius: 1rem;
`;

const WorkCard: React.FC<CardProps> = ({ work }) => {
  const { general, dimensions, year, media, medium, technique } = work;
  const { title, slug } = general;
  const [mouveOver, setMouseOver] = useState<boolean>(false);
  const displayedTechnique = technique || medium;

  const color = getRitasColor();

  return (
    <div
      className="rounded work-card flex-shrink-0 d-flex flex-column justify-content-between position-relative"
      style={{
        cursor: "pointer",
        width: "300px",
        transition: "all 0.3s ease",
      }}
      onMouseOver={() => setMouseOver(true)}
      onMouseLeave={() => setMouseOver(false)}
    >
      {/* Overlay that appears on hover */}
      {mouveOver && (
        <Hover color={color}>
          <Link to={`${slug}`}>
            <p className="m-0 px-2 fs-1 fw-light">View</p>
          </Link>
        </Hover>
      )}

      <Row className="gap-3 p-2 h-75">
        <Col xs={12}>
          {/* Use the Thumbnail component */}
          <Thumbnail media={media} />
        </Col>
      </Row>

      <Row>
        <Col className="d-flex flex-column align-items-center justify-content-center">
          <p className="fw-bold">{title}</p>
          {
            <p className="text-center">
              {year && (
                <>
                  <span>{year}</span>
                  <br />
                </>
              )}
              {displayedTechnique && (
                <>
                  <span>{displayedTechnique} </span>
                  <br />
                </>
              )}
              {dimensions && (
                <span style={{ fontSize: "0.8em" }}>{dimensions}</span>
              )}
            </p>
          }
        </Col>
      </Row>
    </div>
  );
};

export default WorkCard;
