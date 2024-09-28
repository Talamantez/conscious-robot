// routes/feedback.tsx
import { Handlers, PageProps } from "$fresh/server.ts";
import { Head } from "$fresh/runtime.ts";
import { createGitHubIssue } from "../util/github.ts";

export default function FeedbackPage({ data }: PageProps) {
  return (
    <>
      <Head>
        <title>Feedback Form</title>
        <script src="https://cdn.jsdelivr.net/npm/toastify-js"></script>
        <link rel="stylesheet" type="text/css" href="https://cdn.jsdelivr.net/npm/toastify-js/src/toastify.min.css" />
      </Head>
      <div class="p-4 mx-auto max-w-screen-md">
        <h1 class="text-4xl font-bold">Feedback Form</h1>
        <form id="feedbackForm" method="POST" class="mt-8">
          <div class="mb-4">
            <label for="name" class="block text-gray-700 text-sm font-bold mb-2">Name:</label>
            <input type="text" id="name" name="name" class="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline" required />
          </div>
          <div class="mb-4">
            <label for="email" class="block text-gray-700 text-sm font-bold mb-2">Email:</label>
            <input type="email" id="email" name="email" class="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline" required />
          </div>
          <div class="mb-6">
            <label for="message" class="block text-gray-700 text-sm font-bold mb-2">Feedback:</label>
            <textarea id="message" name="message" rows="4" class="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline" required></textarea>
          </div>
          <div class="flex items-center justify-between">
            <button type="submit" class="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline">
              Submit Feedback
            </button>
            <a href="/" class="bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline">
              Return Home
            </a>
          </div>
        </form>
      </div>
      <script dangerouslySetInnerHTML={{ __html: `
        const form = document.getElementById('feedbackForm');
        form.addEventListener('submit', async (e) => {
          e.preventDefault();
          const formData = new FormData(form);
          try {
            const response = await fetch('/feedback', {
              method: 'POST',
              body: formData,
            });
            if (response.ok) {
              Toastify({
                text: "Feedback submitted successfully!",
                duration: 3000,
                gravity: "top",
                position: "right",
                backgroundColor: "green",
              }).showToast();
              setTimeout(() => {
                window.location.href = '/';
              }, 3000);
            } else {
              const errorData = await response.json();
              throw new Error(errorData.error || 'An error occurred');
            }
          } catch (error) {
            Toastify({
              text: "Error: " + error.message,
              duration: 5000,
              gravity: "top",
              position: "right",
              backgroundColor: "red",
            }).showToast();
          }
        });
      ` }}/>
    </>
  );
}

export const handler: Handlers = {
  async POST(req) {
    const form = await req.formData();
    const name = form.get("name") as string;
    const email = form.get("email") as string;
    const message = form.get("message") as string;

    try {
      const issueTitle = `Feedback from ${name}`;
      const issueBody = `From: ${name} (${email})\n\n${message}`;
      await createGitHubIssue(issueTitle, issueBody);

      return new Response(JSON.stringify({ success: true }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });
    } catch (error) {
      console.error("Error creating GitHub issue:", error);
      return new Response(JSON.stringify({ error: error.message }), { 
        status: 500,
        headers: { "Content-Type": "application/json" }
      });
    }
  },
};