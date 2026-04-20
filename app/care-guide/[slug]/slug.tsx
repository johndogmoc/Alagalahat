import { notFound } from "next/navigation";
import Link from "next/link";
import { AuthShell } from "@/components/AuthShell";
import { articles } from "@/lib/data/articles";

export default async function ArticlePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const article = articles.find((a) => a.slug === slug);

  if (!article) {
    notFound();
  }

  return (
    <AuthShell>
      <div style={{ maxWidth: 800, margin: "0 auto", paddingBottom: 64 }}>
        <Link href="/care-guide" style={{
           display: "inline-flex", alignItems: "center", gap: 6,
           fontSize: 14, fontWeight: 600, color: "var(--color-text-muted)",
           textDecoration: "none", marginBottom: 24, padding: "8px 0"
        }}>
           ← Back to Care Guide
        </Link>
        <div style={{
           background: "var(--color-card)", border: "1px solid var(--color-border)",
           borderRadius: 16, padding: "40px", boxShadow: "var(--shadow-sm)"
        }}>
           <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 16 }}>
             {article.tags.map((tag) => (
               <span key={tag} style={{
                 padding: "4px 12px", borderRadius: 12, fontSize: 12, fontWeight: 700,
                 background: "var(--color-primary)" + "18", color: "var(--color-primary)"
               }}>
                 {tag}
               </span>
             ))}
           </div>
           
           <h1 style={{ fontSize: 32, fontWeight: 800, margin: "0 0 16px", color: "var(--color-text)", lineHeight: 1.2 }}>
             {article.title}
           </h1>
           <div style={{ display: "flex", gap: 16, fontSize: 14, color: "var(--color-text-muted)", marginBottom: 32, paddingBottom: 32, borderBottom: "1px solid var(--color-border)" }}>
             <span>{article.readTime}</span>
             <span>•</span>
             <span style={{ textTransform: "capitalize" }}>{article.category.replace("_", " ")}</span>
           </div>

           {/* Markdown-like article content styling */}
           <div 
             className="article-content"
             dangerouslySetInnerHTML={{ __html: article.content }} 
             style={{ fontSize: 16, lineHeight: 1.8, color: "var(--color-text)" }}
           />
        </div>
      </div>

      <style>{`
        .article-content h2 {
          font-size: 22px;
          margin-top: 32px;
          margin-bottom: 16px;
          color: var(--color-text);
        }
        .article-content p {
          margin-bottom: 20px;
        }
        .article-content ul, .article-content ol {
          margin-bottom: 24px;
          padding-left: 24px;
        }
        .article-content li {
          margin-bottom: 8px;
        }
        @media (max-width: 600px) {
          .article-content h1 {
            font-size: 26px !important;
          }
        }
      `}</style>
    </AuthShell>
  );
}
