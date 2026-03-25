import { Product } from '../services/api';

type ProductReviewSectionsProps = {
  product: Product;
};

function toFeatureBullets(text: string): string[] {
  return (
    text
      ?.split(/\r?\n|[.;]\s+/)
      .map((s) => s.replace(/^[-*]\s*/, '').trim())
      .filter((s) => s.length >= 28)
      .slice(0, 5) ?? []
  );
}

export function ProductReviewSections({ product }: ProductReviewSectionsProps) {
  const features = product.pros?.length ? product.pros : toFeatureBullets(product.description);
  const pros = product.pros?.length ? product.pros : features.slice(0, 3);
  const cons = product.cons?.length ? product.cons : ['Check the latest price, availability, and specs before buying.'];

  const verdictWorth =
    product.verdict === 'worth'
      ? true
      : product.verdict === 'not_worth'
        ? false
        : (product.rating || 0) >= 4;

  const faqs =
    product.faqs?.length && product.faqs.length > 0
      ? product.faqs
      : [
          {
            question: `Is ${product.name} worth buying?`,
            answer: verdictWorth
              ? 'Yes. It is a practical pick for daily use and offers strong value.'
              : 'Maybe not. It can disappoint if you expect premium performance for its current price.',
          },
          {
            question: `Where can I buy ${product.name}?`,
            answer: 'Use the affiliate buttons on this page to see current pricing and availability.',
          },
        ];

  return (
    <section className="space-y-6 mt-10">
      <article className="bg-gray-900/50 backdrop-blur-lg border border-gray-800/50 rounded-2xl p-6">
        <h2 className="text-xl text-white mb-3">Product overview</h2>
        <p className="text-gray-300 leading-relaxed">{product.description}</p>
      </article>

      <article className="bg-gray-900/50 backdrop-blur-lg border border-gray-800/50 rounded-2xl p-6">
        <h2 className="text-xl text-white mb-3">Features</h2>
        <ul className="list-disc pl-5 text-gray-300 space-y-1">
          {(features.length ? features : [product.tagline]).map((f) => (
            <li key={f}>{f}</li>
          ))}
        </ul>
      </article>

      <article className="bg-gray-900/50 backdrop-blur-lg border border-gray-800/50 rounded-2xl p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <h3 className="text-lg text-green-400 mb-3">Pros</h3>
          <ul className="list-disc pl-5 text-gray-300 space-y-1">
            {pros.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </div>
        <div>
          <h3 className="text-lg text-rose-400 mb-3">Cons</h3>
          <ul className="list-disc pl-5 text-gray-300 space-y-1">
            {cons.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </div>
      </article>

      <article className="bg-gray-900/50 backdrop-blur-lg border border-gray-800/50 rounded-2xl p-6">
        <h2 className="text-xl text-white mb-3">Ad vs Reality verdict</h2>
        <p className={`text-lg font-semibold ${verdictWorth ? 'text-green-400' : 'text-rose-400'}`}>
          {verdictWorth ? '✅ Worth Buying' : '❌ Not Worth'}
        </p>
      </article>

      <article className="bg-gray-900/50 backdrop-blur-lg border border-gray-800/50 rounded-2xl p-6">
        <h2 className="text-xl text-white mb-3">FAQ</h2>
        <div className="space-y-4">
          {faqs.map((faq) => (
            <div key={faq.question}>
              <h3 className="text-white font-medium">{faq.question}</h3>
              <p className="text-gray-400 text-sm mt-1">{faq.answer}</p>
            </div>
          ))}
        </div>
      </article>
    </section>
  );
}

