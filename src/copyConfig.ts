import { EditableCopy } from "./types";

// EASILY EDITABLE COPY CONFIGURATION
// Swap in your own title, target audience, and marketing copy below:
export const COPY_CONFIG: EditableCopy = {
  ebookTitle: "The First Step to Becoming",
  targetAudience: "Those Seeking Purpose & Healing",
  
  headline: "The First Step to Becoming: Why You Feel Lost (And Where to Begin)",
  subheadline: "A companion, not a map. Download the powerful guide by Gbolahan Oyegoke. Get 12 short, honest parts, a 7-day practice, and the 1 question that changes your search.",
  
  bullets: [
    "12 Short, Honest Parts addressing the quiet panic of feeling behind.",
    "A Gentle 7-Day Practice to start moving without waiting to feel ready.",
    "The 1 Crucial Question that releases you from measuring your life by comparison."
  ],
  
  testimonials: [
    {
      text: "Maybe the greatest pain so many of us carry isn't that we're lost. Maybe it's believing we're the only ones who are. This companion guide completely changed how I see my struggle.",
      author: "Strangers Online Feedback",
      role: "Online Community Message",
      rating: 5,
      avatarUrl: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80"
    },
    {
      text: "I spent years fighting behaviors without understanding the beliefs feeding them. Gbolahan's words gave me the permission to stop hiding from myself and finally begin healing.",
      author: "David Cole",
      role: "Newsletter Reader",
      rating: 5,
      avatarUrl: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&auto=format&fit=crop&q=80"
    }
  ],
  
  aboutHeadline: "A Companion, Not a Map",
  aboutBody: "I didn't write this because I've figured life out. I haven't. I'm still learning. Every lesson in this guide comes from something I've had to wrestle with. It is an invitation to ask the questions you've been carrying in silence, release the stories you never chose, and take the next faithful step.",
  
  closingHeadline: "Stop waiting for life to begin. Start becoming today.",
  closingBody: "Something beautiful happens when we stop waiting for life to begin. We realize it quietly began the moment we chose to move. Claim Gbolahan Oyegoke's free companion guide now."
};

/**
 * Helper function to parse placeholders {{EBOOK_TITLE}} and {{TARGET_AUDIENCE}} in any string
 */
export function renderCopy(text: string, title = COPY_CONFIG.ebookTitle, audience = COPY_CONFIG.targetAudience): string {
  return text
    .replace(/\{\{EBOOK_TITLE\}\}/g, title)
    .replace(/\{\{TARGET_AUDIENCE\}\}/g, audience);
}
