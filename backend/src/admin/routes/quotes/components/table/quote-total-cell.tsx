import { useOrderPreview } from "../../../../hooks/api";
import { TextCell } from "../../../../components/common/table/table-cells/text-cell";

interface QuoteTotalCellProps {
  quote: {
    draft_order_id: string;
    draft_order: {
      currency_code: string;
      total: number;
    };
  };
}

export const QuoteTotalCell = ({ quote }: QuoteTotalCellProps) => {
  const { order: preview, isLoading } = useOrderPreview(
    quote.draft_order_id,
    {},
    { enabled: !!quote.draft_order_id }
  );

  if (isLoading) {
    return <TextCell text="Loading..." />;
  }

  // Use preview total if available, otherwise fall back to original total
  const currentTotal = preview?.summary?.current_order_total ?? preview?.total ?? quote.draft_order.total;

  return (
    <TextCell
      text={`${quote.draft_order.currency_code.toUpperCase()} ${currentTotal}`}
    />
  );
};