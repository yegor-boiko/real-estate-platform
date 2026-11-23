export default function Footer() {
  return (
    <footer className="border-top bg-white mt-5 py-4">
      <div className="container">
        <p className="small text-muted mb-2">
          <strong>Data source:</strong> ATAL Spółka Akcyjna, published via{" "}
          <a
            href="https://dane.gov.pl"
            target="_blank"
            rel="noopener noreferrer"
          >
            dane.gov.pl
          </a>
          . Apartment offering prices as of 19 November 2026, disclosed under
          Article 19b of Polish developer legislation.
        </p>

        <p className="small text-muted mb-0">
          Licence:{" "}
          <a
            href="https://creativecommons.org/publicdomain/zero/1.0/legalcode.pl"
            target="_blank"
            rel="noopener noreferrer"
          >
            CC0 1.0
          </a>
          . Prices and availability may have changed.
        </p>
      </div>
    </footer>
  );
}
