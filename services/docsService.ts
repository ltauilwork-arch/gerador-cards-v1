export const getDocContent = async (accessToken: string, fileId: string): Promise<string> => {
  try {
    const response = await fetch(
      `https://www.googleapis.com/docs/v1/documents/${fileId}`,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );

    if (!response.ok) {
      throw new Error(`Error fetching document: ${response.statusText}`);
    }

    const doc = await response.json();
    return parseDocContent(doc);
  } catch (error) {
    console.error("Failed to get doc content:", error);
    throw error;
  }
};

// Helper to extract text from the complex Google Docs JSON structure
interface DocElement {
  textRun?: {
    content: string;
  };
}

interface DocParagraph {
  elements: DocElement[];
}

interface DocContent {
  paragraph?: DocParagraph;
}

interface GoogleDoc {
  body: {
    content: DocContent[];
  };
}

const parseDocContent = (doc: GoogleDoc): string => {
  const content = doc.body.content;
  let text = "";

  if (!content || !Array.isArray(content)) {
    return "";
  }

  content.forEach((element) => {
    if (element.paragraph) {
      element.paragraph.elements.forEach((el) => {
        if (el.textRun && el.textRun.content) {
          text += el.textRun.content;
        }
      });
    }
  });

  return text;
};
