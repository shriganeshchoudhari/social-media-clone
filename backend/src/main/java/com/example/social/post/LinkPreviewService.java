package com.example.social.post;

import org.jsoup.Jsoup;
import org.jsoup.nodes.Document;
import org.springframework.stereotype.Service;

import java.io.IOException;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

@Service
public class LinkPreviewService {

    private static final Pattern URL_PATTERN = Pattern.compile("(https?://\\S+)");

    public LinkMetadata extractLinkMetadata(String content) {
        Matcher matcher = URL_PATTERN.matcher(content);
        if (matcher.find()) {
            String url = matcher.group(1);
            try {
                Document doc = Jsoup.connect(url)
                        .userAgent(
                                "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36")
                        .timeout(5000)
                        .get();

                String title = getMetaTag(doc, "og:title");
                if (title == null)
                    title = doc.title();

                String description = getMetaTag(doc, "og:description");
                if (description == null)
                    description = getMetaTag(doc, "description");

                String image = getMetaTag(doc, "og:image");

                return new LinkMetadata(url, title, description, image);

            } catch (IOException e) {
                // Ignore errors, just return null or the url itself
                System.err.println("Failed to fetch link preview for: " + url + " - " + e.getMessage());
            }
        }
        return null;
    }

    private String getMetaTag(Document doc, String property) {
        var element = doc.select("meta[property=" + property + "]").first();
        if (element != null) {
            return element.attr("content");
        }
        element = doc.select("meta[name=" + property + "]").first();
        return element != null ? element.attr("content") : null;
    }

    public record LinkMetadata(String url, String title, String description, String image) {
    }
}
