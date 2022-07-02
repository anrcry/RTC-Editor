import { Nav, Navbar, NavDropdown } from 'react-bootstrap';
import { LinkContainer } from "react-router-bootstrap";
import { decode } from 'jsonwebtoken';
import { useUserDetails } from '../api/api';

export default function Navigation({ token }) {
  const { sub } = token ? decode(token) : {};
  const { fullName } = useUserDetails({ userId: sub });

  return (
    <Navbar bg="light" variant="light">
      <Navbar.Brand>Tiny Docs</Navbar.Brand>
      {
        sub ? (
          <>
            <Nav>
              <LinkContainer to="/documents"><Nav.Link>Documents</Nav.Link></LinkContainer>
            </Nav>
            <Nav>
              <NavDropdown title={fullName ?? sub} id="account-dropdown">
                <LinkContainer to="/logout"><NavDropdown.Item>Logout</NavDropdown.Item></LinkContainer>
              </NavDropdown>
            </Nav>
          </>
        ) : (
          <>
            <Nav>
              <LinkContainer to="/login"><Nav.Link>Login/Register</Nav.Link></LinkContainer>
            </Nav>
          </>
        )
      }
    </Navbar>
  );
}