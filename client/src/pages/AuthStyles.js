import styled, { css } from "styled-components";

export const Container = styled.div`
  background-color: ${({ theme }) => theme.palette.background.paper};
  border-radius: 10px;
  box-shadow: ${({ theme }) =>
    theme.palette.mode === "dark"
      ? "0 14px 28px rgba(0,0,0,0.7), 0 10px 10px rgba(0,0,0,0.5)"
      : "0 14px 28px rgba(0,0,0,0.25), 0 10px 10px rgba(0,0,0,0.22)"};
  position: relative;
  overflow: hidden;
  width: 700px;
  max-width: 99vw;
  min-height: 440px;
  color: ${({ theme }) => theme.palette.text.primary};
  font-family: ${({ theme }) => theme.typography.fontFamily};
`;

export const SignUpContainer = styled.div`
  position: absolute;
  top: 0; height: 100%; transition: all 0.6s ease-in-out;
  left: 0; width: 50%; opacity: 0; z-index: 1;
  ${({ $signingIn }) =>
    !$signingIn &&
    css`
      transform: translateX(100%);
      opacity: 1;
      z-index: 5;
    `}
`;

export const SignInContainer = styled.div`
  position: absolute;
  top: 0; height: 100%; transition: all 0.6s ease-in-out;
  left: 0; width: 50%; z-index: 2;
  ${({ $signingIn }) =>
    !$signingIn &&
    css`
      transform: translateX(100%);
    `}
`;

export const Form = styled.form`
  background-color: ${({ theme }) => theme.palette.background.default};
  display: flex; flex-direction: column; align-items: center; justify-content: center;
  padding: 0 45px; height: 100%; text-align: center;
`;

export const Title = styled.h1`
  font-weight: bold; margin: 0; font-size: 2.2rem; word-break: break-word;
  text-transform: uppercase; color: ${({ theme }) => theme.palette.text.primary};
  font-family: ${({ theme }) => theme.typography.fontFamily};
`;

export const Input = styled.input`
  background-color: ${({ theme }) => theme.palette.mode === "dark" ? "#444" : "#eee"};
  border: none; border-radius: 4px; color: ${({ theme }) => theme.palette.text.primary};
  padding: 12px 15px; margin: 8px 0; width: 100%; box-sizing: border-box;
  ::placeholder {
    color: ${({ theme }) => theme.palette.mode === "dark" ? "#bbb" : "#666"};
  }
`;

export const Button = styled.button`
  border-radius: 20px; border: 1px solid ${({ theme }) => theme.palette.primary.main};
  background-color: ${({ theme }) => theme.palette.primary.main};
  color: ${({ theme }) => theme.palette.primary.contrastText};
  font-size: 14px; font-weight: bold; padding: 14px 50px; letter-spacing: 1px;
  text-transform: uppercase; margin-top: 8px; cursor: pointer;
  transition: background-color 0.3s ease, color 0.3s ease, transform 80ms ease-in;

  &:active { transform: scale(0.97); }
  &:focus { outline: none; }
  &:hover {
    background-color: ${({ theme }) => theme.palette.primary.dark || theme.palette.primary.main};
    border-color: ${({ theme }) => theme.palette.primary.dark || theme.palette.primary.main};
  }
`;

export const GhostButton = styled(Button)`
  background-color: transparent;
  border-color: ${({ theme }) => theme.palette.secondary.main};
  color: ${({ theme }) => theme.palette.secondary.main};
  padding: 14px 48px;

  &:hover {
    background-color: ${({ theme }) => theme.palette.secondary.light || "transparent"};
    color: ${({ theme }) => theme.palette.secondary.contrastText || theme.palette.secondary.main};
    border-color: ${({ theme }) => theme.palette.secondary.main};
  }
`;

export const Anchor = styled.a`
  color: ${({ theme }) => theme.palette.text.secondary};
  font-size: 15px;
  text-decoration: none;
  margin: 15px 0;
  word-break: break-word;
  cursor: pointer;

  &:hover,
  &:focus {
    color: ${({ theme }) => theme.palette.primary.main};
  }
`;

export const OverlayContainer = styled.div`
  position: absolute; top: 0; left: 50%; width: 50%; height: 100%;
  overflow: hidden; transition: transform 0.6s ease-in-out; z-index: 100;
  ${({ $signingIn }) => !$signingIn && css`transform: translateX(-100%);`}
`;

export const Overlay = styled.div`
  background-color: ${({ theme }) => theme.palette.primary.main};
  color: ${({ theme }) => theme.palette.primary.contrastText};
  position: relative; left: -100%; height: 100%; width: 200%;
  transform: translateX(0); transition: transform 0.6s ease-in-out;
  display: flex; align-items: stretch; justify-content: stretch;
  ${({ $signingIn }) => !$signingIn && css`transform: translateX(50%);`}
`;

export const OverlayPanel = styled.div`
  position: absolute; display: flex; align-items: center; justify-content: center;
  flex-direction: column; top: 0; height: 100%; width: 50%;
  padding: 0 32px; text-align: center; box-sizing: border-box;
  transition: transform 0.6s ease-in-out;
  color: ${({ theme }) => theme.palette.primary.contrastText};
`;

export const LeftOverlayPanel = styled(OverlayPanel)`
  left: 0; transform: translateX(-20%);
  ${({ $signingIn }) => !$signingIn && css`transform: translateX(0);`}
`;

export const RightOverlayPanel = styled(OverlayPanel)`
  left: 50%; transform: translateX(0);
  ${({ $signingIn }) => !$signingIn && css`transform: translateX(20%);`}
`;

export const Paragraph = styled.p`
  font-size: 16px; font-weight: 400; line-height: 1.7; letter-spacing: 0.5px;
  margin: 20px 0 30px; max-width: 90%; overflow-wrap: break-word;
  word-break: break-word; white-space: pre-line; box-sizing: border-box;
  color: ${({ theme }) => theme.palette.primary.contrastText};
`;
