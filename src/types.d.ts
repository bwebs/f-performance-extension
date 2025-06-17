import { LookerDashboardOptions } from "@looker/embed-sdk";

type GlobalFilters = { [key: string]: string };

interface ColorApplication {
  collection_id: string;
  palette_id: string;
  options?: {
    steps: number;
    __FILE?: string;
    __LINE_NUM?: number;
  };
}

interface ConditionalFormatting {
  type: string;
  value: number | null;
  background_color?: string;
  font_color?: string;
  color_application?: ColorApplication;
  bold?: boolean;
  italic?: boolean;
  strikethrough?: boolean;
  fields?: string[] | null;
  __FILE?: string;
  __LINE_NUM?: number;
}

interface YAxis {
  label: string | null;
  orientation: "left" | "right";
  series: Array<{
    id: string;
    name: string;
    axisId?: string;
    __FILE?: string;
    __LINE_NUM?: number;
  }>;
  showLabels?: boolean;
  showValues?: boolean;
  maxValue?: number | null;
  minValue?: number | null;
  valueFormat?: string | null;
  unpinAxis?: boolean;
  tickDensity?: string;
  tickDensityCustom?: number;
  type?: string;
  __FILE?: string;
  __LINE_NUM?: number;
}

interface VisConfig {
  type: string;
  custom_color_enabled?: boolean;
  show_single_value_title?: boolean;
  show_comparison?: boolean;
  comparison_type?: string;
  comparison_reverse_colors?: boolean;
  show_comparison_label?: boolean;
  enable_conditional_formatting?: boolean;
  conditional_formatting_include_totals?: boolean;
  conditional_formatting_include_nulls?: boolean;
  font_size?: string | number;
  text_color?: string;
  colors?: string[];
  single_value_title?: string;
  custom_color?: string;
  show_view_names?: boolean;
  x_axis_gridlines?: boolean;
  y_axis_gridlines?: boolean;
  show_y_axis_labels?: boolean;
  show_y_axis_ticks?: boolean;
  y_axis_tick_density?: string;
  y_axis_tick_density_custom?: number;
  show_x_axis_label?: boolean;
  show_x_axis_ticks?: boolean;
  y_axis_scale_mode?: string;
  x_axis_reversed?: boolean;
  y_axis_reversed?: boolean;
  plot_size_by_field?: boolean;
  trellis?: string;
  stacking?: string;
  limit_displayed_rows?: boolean;
  legend_position?: string;
  point_style?: string;
  show_value_labels?: boolean;
  label_density?: number;
  x_axis_scale?: string;
  y_axis_combined?: boolean;
  ordering?: string;
  show_null_labels?: boolean;
  show_totals_labels?: boolean;
  show_silhouette?: boolean;
  totals_color?: string;
  color_application?: ColorApplication;
  y_axes?: YAxis[];
  y_axis_labels?: string[];
  y_axis_value_format?: string;
  hide_legend?: boolean;
  series_colors?: Record<string, string>;
  series_types?: Record<string, string>;
  series_labels?: Record<string, string>;
  hidden_fields?: string[];
  defaults_version?: number;
  note_state?: string;
  note_display?: string;
  note_text?: string;
  conditional_formatting?: ConditionalFormatting[];
}

interface DashboardElement {
  title: string;
  title_hidden: boolean;
  vis_config?: VisConfig;
}

interface DashboardOptions {
  layouts: LookerDashboardOptions["layouts"];
  elements: Record<string, DashboardElement>;
}
