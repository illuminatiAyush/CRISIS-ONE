import React from "react";
import { roles, Role } from "@/data/role";
import { useLanguage } from "@/contexts/LanguageContext";

interface Props {
  onSelect: (role: Role) => void;
  excludeRoles?: Role[];
}

const RoleSelection = ({ onSelect, excludeRoles = [] }: Props) => {
  const { t } = useLanguage();

  return (
    <div className="w-full max-w-5xl">
      <h2 className="text-3xl font-bold text-blue-700 text-center mb-2">
        {t("auth.role")}
      </h2>
      <p className="text-blue-600 text-center mb-10">
        {t("auth.signin_title")}
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {roles
          .filter((role) => !excludeRoles.includes(role.id))
          .map((role) => (
            <div
              key={role.id}
              onClick={() => onSelect(role.id)}
              className="cursor-pointer bg-white border border-blue-200 rounded-xl p-6
                       hover:border-blue-500 hover:shadow-lg transition group shadow-sm"
            >
              <div className="w-12 h-12 rounded-lg bg-blue-100 flex items-center justify-center
                            text-blue-600 font-bold text-lg mb-4 uppercase">
                {role.id.charAt(0)}
              </div>

              <h3 className="text-lg font-semibold text-blue-700 mb-1">
                {t(`roles.${role.id}`)}
              </h3>

              <p className="text-sm text-gray-600">
                {t(`roles.${role.id}_desc`)}
              </p>

              <p className="mt-4 text-xs text-blue-500 opacity-0 group-hover:opacity-100 transition font-medium">
                {t("common.view")} →
              </p>
            </div>
          ))}
      </div>
    </div>
  );
};

export default RoleSelection;
