import { Component } from "react";
import { Alert, Box, Button, Container, Typography } from "@mui/material";

export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, message: "" };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, message: error?.message || "Gabim i papritur" };
  }

  render() {
    if (this.state.hasError) {
      return (
        <Container maxWidth="sm" className="py-16">
          <Alert severity="error" className="rounded-2xl! mb-4">
            Diçka shkoi keq gjatë shfaqjes së faqes.
          </Alert>
          <Typography className="text-slate-600! dark:text-slate-300! mb-4!">
            {this.state.message}
          </Typography>
          <Button
            variant="contained"
            onClick={() => window.location.reload()}
            className="rounded-xl! normal-case! font-bold!"
          >
            Rifresko faqen
          </Button>
        </Container>
      );
    }
    return this.props.children;
  }
}
