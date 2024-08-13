import { Document, Model, PopulateOptions } from "mongoose";

interface PaginationParams {
  page: number;
  limit: number;
}

interface PaginationResult<T> {
  data: T[];
  currentPage: number;
  totalPages: number;
  totalItems: number;
}

export const paginate = async <T extends Document>(
  model: Model<T>,
  query: object,
  options: PaginationParams,
  populateOptions: Array<string | PopulateOptions> = []
): Promise<PaginationResult<T>> => {
  const { page = 1, limit = 10 } = options;
  const skip = (page - 1) * limit;

  // Start building the query with skip and limit
  let queryChain = model.find(query).skip(skip).limit(limit);

  // Apply populate options
  populateOptions.forEach((populateOption) => {
    if (typeof populateOption === "string") {
      queryChain = queryChain.populate(populateOption);
    } else {
      queryChain = queryChain.populate(populateOption);
    }
  });

  const data = await queryChain.exec();

  const totalItems = await model.countDocuments(query);

  return {
    data,
    currentPage: page,
    totalPages: Math.ceil(totalItems / limit),
    totalItems,
  };
};
