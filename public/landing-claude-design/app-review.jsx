// review-only — solo monta tokens + button states + banner

const ReviewApp = () => (
  <>
    <ReviewBanner />
    <TokensPreview />
    <ButtonStates />
  </>
);

ReactDOM.createRoot(document.getElementById("root")).render(<ReviewApp />);
