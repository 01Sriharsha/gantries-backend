import { TagModel } from "../models/tag.model";

// Helper function to get or create tags
export const getOrCreateTags = async (tagNames: string[]) => {
    const tags = await Promise.all(
      tagNames.map(async (tagName) => {
        let tag = await TagModel.findOne({ name: tagName });
        if (!tag) {
          tag = new TagModel({ name: tagName });
          await tag.save();
        }
        return tag;
      })
    );
    return tags;
  };