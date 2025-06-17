import { ILookerConnection } from "@looker/embed-sdk";
import {
  IDashboard,
  ILookmlModelExplore,
  IMergeQuery,
  IQuery,
  IUser,
} from "@looker/sdk";
import { forEach, get, intersection, keys, map, reduce, set } from "lodash";
import React, { createContext, useContext, useState } from "react";
import useSWR from "swr";
import useSdk from "./hooks/useSdk";
import { DashboardOptions } from "./types";

interface AppContextType {
  isLoading: boolean;
  me: IUser | undefined;
  dashboard_options?: DashboardOptions;
  setDashboardOptions: React.Dispatch<
    React.SetStateAction<DashboardOptions | undefined>
  >;
  colors: Record<string, string>;
  setColors: React.Dispatch<React.SetStateAction<Record<string, string>>>;
  dashboard: ILookerConnection | undefined;
  setDashboard: React.Dispatch<
    React.SetStateAction<ILookerConnection | undefined>
  >;
  applyColorChange: (key: string, color: string | null) => void;
  getDashboardMetadata: (dashboard_id: string) => Promise<void>;
  resetDashboardMetadata: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppContextProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const sdk = useSdk();
  const [dashboard_options, setDashboardOptions] = useState<DashboardOptions>();
  const [dashboard, setDashboard] = useState<ILookerConnection>();
  const [dashboard_metadata, setDashboardMetadata] = useState<{
    dashboard: IDashboard;
    model_explores: {
      [model_explore: string]: ILookmlModelExplore;
    };
    element_query_measures: {
      [element_id: string]: {
        [query_id: string]: {
          fields: string[];
          pivots: string[];
          measures: string[];
        };
      };
    };
    merge_results: {
      [merge_result_id: string]: IMergeQuery;
    };
  }>();

  const [colors, setColors] = useState<Record<string, string>>({});
  const { data: me, isLoading, error } = useSWR("me", () => sdk.ok(sdk.me()));

  const dashboard_id = dashboard?._currentPathname?.startsWith(
    `/embed/dashboards/`
  )
    ? dashboard?._currentPathname?.split("/").pop()
    : undefined;

  const resetDashboardMetadata = () => {
    setDashboardMetadata(undefined);
  };

  const getDashboardMetadata = async (dashboard_id: string) => {
    const current_dashboard = await sdk.ok(
      sdk.dashboard(dashboard_id, "id,dashboard_elements")
    );
    const model_explores = new Set<string>();
    const merge_result_ids = new Set<string>();

    const element_query_fields = reduce(
      current_dashboard?.dashboard_elements,
      (acc, element) => {
        const element_id = get(element, ["id"]);
        if (!element_id) return acc;
        const query = get(element, ["result_maker", "query"]);
        const query_id = get(query, ["id"]);
        if (query_id) {
          const model = get(query, ["model"]);
          const explore = get(query, ["view"]);
          const fields = get(query, ["fields"], []);
          const pivots = get(query, ["pivots"], []);
          if (model && explore && fields) {
            set(acc, [element_id, query_id], {
              model,
              explore,
              fields,
              pivots,
            });
            model_explores.add(`${model}::${explore}`);
          }
        } else {
          const merge_result_id = get(element, ["merge_result_id"]);
          if (merge_result_id) {
            merge_result_ids.add(merge_result_id);
          }
        }
        return acc;
      },
      {} as {
        [id: string]: {
          [query_id: string]: {
            model: string;
            explore: string;
            fields: string[];
            pivots: string[];
          };
        };
      }
    );

    let model_explore_promises: Promise<ILookmlModelExplore>[] = [];
    Array.from(model_explores).forEach((model_explore) => {
      model_explore_promises.push(
        sdk.ok(
          sdk.lookml_model_explore({
            lookml_model_name: model_explore.split("::")[0],
            explore_name: model_explore.split("::")[1],
            fields: "model_name,name,fields(measures(name))",
          })
        )
      );
    });

    // go get merge queries and their source queries
    let merge_result_promises: Promise<IMergeQuery>[] = [];
    const merge_results = await Promise.all(merge_result_promises);
    const query_id_list: { element_id: string; query_id: string }[] = [];
    const query_id_promises: Promise<IQuery>[] = [];
    merge_results.forEach((merge_result) => {
      const sources = get(merge_result, ["source_queries"]);
      forEach(sources, (source) => {
        const query_id = get(source, ["query_id"]);
        if (query_id) {
          query_id_promises.push(sdk.ok(sdk.query(query_id)));
          query_id_list.push({
            element_id: get(source, ["element_id"]),
            query_id: query_id,
          });
        }
      });
    });
    const merge_source_queries = await Promise.all(query_id_promises);

    // go get all the explores
    let explores = await Promise.all(model_explore_promises);
    const model_explores_map = reduce(
      explores,
      (acc, explore) => {
        const explore_id = `${explore.model_name}::${explore.name}`;

        if (explore_id) {
          set(acc, [explore_id], explore);
        }
        return acc;
      },
      {} as { [model_explore: string]: ILookmlModelExplore }
    );

    // go get all the field and measure metadata for each dashboard element that was a query
    let element_query_measures = Object.keys(element_query_fields).reduce(
      (acc, element_id) => {
        const element = element_query_fields[element_id];
        Object.keys(element).forEach((query_id) => {
          const { model, explore, fields, pivots } = element[query_id];
          let measures = [...fields];

          if (model && explore && fields?.length) {
            const explore_measures = map(
              get(model_explores_map, [
                `${model}::${explore}`,
                "fields",
                "measures",
              ]),
              (measure) => measure.name
            ).filter(Boolean) as string[];

            if (explore_measures?.length) {
              measures = intersection(measures, explore_measures);
            } else {
              measures = [];
            }
          }
          set(acc, [element_id, query_id], {
            fields,
            pivots,
            measures: measures,
          });
        });
        return acc;
      },
      {} as {
        [element_id: string]: {
          [query_id: string]: {
            fields: string[];
            pivots: string[];
            measures: string[];
          };
        };
      }
    );

    // iterate through all the merge source queries and add their fields, pivots, and measures to the element_query_measures map
    merge_source_queries.forEach((query, index) => {
      const query_id_list_item = query_id_list[index];
      const query_id = get(query, ["id"]);
      if (query_id) {
        const fields = get(query, ["fields"], []);
        const pivots = get(query, ["pivots"], []);
        const measures = get(query, ["measures"], []);
        set(element_query_measures, [query_id_list_item.element_id, query_id], {
          fields: fields,
          pivots: pivots,
          measures: measures,
        });
      }
    });

    // save the merge_results_metdata
    const merge_results_map = reduce(
      merge_results,
      (acc, merge_result) => {
        const merge_result_id = get(merge_result, ["id"]);
        if (merge_result_id) {
          set(acc, [merge_result_id], merge_result);
        }
        return acc;
      },
      {} as { [merge_result_id: string]: IMergeQuery }
    );

    setDashboardMetadata({
      model_explores: model_explores_map,
      element_query_measures,
      dashboard: current_dashboard,
      merge_results: merge_results_map,
    });
  };

  const applyColorChange = (key: string, color: string | null) => {
    const new_colors = { ...colors };
    if (color) {
      new_colors[key] = color;
    } else {
      delete new_colors[key];
    }

    setColors(new_colors);

    if (dashboard && dashboard_options?.elements) {
      dashboardApplyColors(new_colors);
    }
  };

  const dashboardApplyColors = (new_colors?: Record<string, string>) => {
    const update_colors = { ...colors, ...(new_colors || {}) };
    const all_color_values = new Set(keys(update_colors));
    const all_element_query_measures = get(
      dashboard_metadata,
      ["element_query_measures"],
      {}
    );
    const all_element_ids = keys(all_element_query_measures);
    const all_measure_names_set = new Set();
    all_element_ids.forEach((element_id) => {
      const element_queries = keys(
        get(all_element_query_measures, [element_id])
      );
      element_queries.forEach((query_id) => {
        const query_measures = get(
          all_element_query_measures,
          [element_id, query_id, "measures"],
          []
        ) as string[];
        query_measures.forEach((measure) => all_measure_names_set.add(measure));
      });
    });
    const new_elements = { ...dashboard_options?.elements };
    keys(dashboard_options?.elements).forEach((element_id) => {
      all_measure_names_set.forEach((measure_name) => {
        all_color_values.forEach((color_key) => {
          const new_color_key = `${color_key} - ${measure_name}`;
          const new_color_value = get(update_colors, [color_key]);
          set(
            new_elements,
            [element_id, "vis_config", "series_colors", new_color_key],
            new_color_value
          );
        });
      });
    });
    dashboard?.asDashboardConnection().setOptions({
      ...dashboard_options,
      elements: new_elements,
    });
  };

  return (
    <AppContext.Provider
      value={{
        me,
        isLoading,
        dashboard_options,
        setDashboardOptions,
        colors,
        setColors,
        dashboard,
        setDashboard,
        applyColorChange,
        getDashboardMetadata,
        resetDashboardMetadata,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useAppContext = () => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error("useAppContext must be used within an AppContextProvider");
  }
  return context;
};
