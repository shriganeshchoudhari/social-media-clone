package com.example.social.post;

import org.junit.jupiter.api.Test;
import static org.junit.jupiter.api.Assertions.*;

class LinkPreviewServiceTest {

    @Test
    void testExtractLinkMetadata() {
        LinkPreviewService service = new LinkPreviewService();
        // Use a known stable URL that likely has OG tags
        String content = "Check this out https://github.com";
        LinkPreviewService.LinkMetadata metadata = service.extractLinkMetadata(content);

        if (metadata == null) {
            System.out.println("Metadata is null. Jsoup likely failed.");
        } else {
            System.out.println("Metadata extracted successfully:");
            System.out.println("URL: " + metadata.url());
            System.out.println("Title: " + metadata.title());
            System.out.println("Description: " + metadata.description());
            System.out.println("Image: " + metadata.image());
        }

        assertNotNull(metadata, "Metadata should not be null for github.com");
    }

    @Test
    void testExtractLinkMetadata_NoProtocol() {
        LinkPreviewService service = new LinkPreviewService();
        String content = "Check this out www.github.com";
        LinkPreviewService.LinkMetadata metadata = service.extractLinkMetadata(content);

        assertNotNull(metadata, "Metadata should not be null for www.github.com");
        assertEquals("https://www.github.com", metadata.url());
    }
}
