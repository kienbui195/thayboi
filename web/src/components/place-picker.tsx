"use client";

import { MapPinIcon } from "lucide-react";
import { useEffect, useState } from "react";
import type { Place } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { Spinner } from "@/components/ui/spinner";

/** "Nam Định, Ninh Bình, Việt Nam" — bỏ phần trùng tên (Open-Meteo hay trả admin2 giống tên). */
function placeLabel(p: Place) {
  return [...new Set([p.name, ...p.region.split(", "), p.country].filter(Boolean))].join(", ");
}

export type PickedPlace = { name: string; latitude: number; longitude: number; timezone: string };

/**
 * Ô tìm nơi sinh. Chỉ nhận địa danh chọn từ gợi ý (BR3): chọn xong mới có tọa độ + múi giờ.
 * Lỗi mạng thì báo, các ô khác của form vẫn giữ (AC-02.4).
 */
export function PlacePicker({
  value,
  onChange,
  invalid,
}: {
  value: PickedPlace | null;
  onChange: (p: PickedPlace | null) => void;
  invalid?: boolean;
}) {
  const [query, setQuery] = useState("");
  const [places, setPlaces] = useState<Place[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (query.trim().length < 2) return;
    const ctrl = new AbortController();
    const timer = setTimeout(async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(`/api/dia-danh?q=${encodeURIComponent(query)}`, { signal: ctrl.signal });
        const body = await res.json();
        if (!res.ok) throw new Error(body.error);
        setPlaces(body.places);
      } catch {
        if (!ctrl.signal.aborted) {
          setPlaces([]);
          setError("Chưa tìm được địa danh, thử lại sau");
        }
      } finally {
        if (!ctrl.signal.aborted) setLoading(false);
      }
    }, 300);
    return () => {
      clearTimeout(timer);
      ctrl.abort();
    };
  }, [query]);

  if (value) {
    return (
      <div className="flex items-center justify-between gap-2 rounded-lg border px-3 py-2 text-sm">
        <span className="flex items-center gap-2">
          <MapPinIcon className="text-muted-foreground" />
          {value.name}
          <span className="text-muted-foreground">
            ({value.latitude.toFixed(2)}, {value.longitude.toFixed(2)} · {value.timezone})
          </span>
        </span>
        <Button type="button" variant="ghost" size="sm" onClick={() => onChange(null)}>
          Đổi
        </Button>
      </div>
    );
  }

  const short = query.trim().length < 2;
  return (
    <Command label="Nơi sinh" shouldFilter={false} className="rounded-lg border" aria-invalid={invalid || undefined}>
      <CommandInput placeholder="Gõ tên tỉnh, huyện, thành phố…" value={query} onValueChange={setQuery} />
      <CommandList>
        {loading && (
          <div className="flex items-center gap-2 p-3 text-sm text-muted-foreground">
            <Spinner /> Đang tìm…
          </div>
        )}
        {!loading && error && <div className="p-3 text-sm text-destructive">{error}</div>}
        {!loading && !error && !short && <CommandEmpty>Không thấy địa danh. Thử tên tỉnh hoặc tên mới.</CommandEmpty>}
        {!short && places.length > 0 && (
          <CommandGroup>
            {places.map((p) => (
              <CommandItem
                key={p.id}
                value={String(p.id)}
                onSelect={() =>
                  onChange({
                    name: placeLabel(p),
                    latitude: p.latitude,
                    longitude: p.longitude,
                    timezone: p.timezone,
                  })
                }
              >
                <MapPinIcon />
                <span>
                  {p.name}
                  <span className="text-muted-foreground"> — {placeLabel(p).slice(p.name.length + 2)}</span>
                </span>
              </CommandItem>
            ))}
          </CommandGroup>
        )}
      </CommandList>
    </Command>
  );
}
