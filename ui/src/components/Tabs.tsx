import React, { useEffect, useRef } from 'react';
import { cn } from '@/lib/utils';

interface Tab {
	label: string;
	value: string;
}

interface TabsProps {
	tabs: Tab[];
	activeTab: string;
	onTabChange: (tabValue: string) => void;
	className?: string;
}

export default function Tabs({ tabs, activeTab, onTabChange, className }: TabsProps) {
	const tabsRef = useRef<HTMLDivElement>(null);
	const activeTabRef = useRef<HTMLButtonElement>(null);

	// Handle keyboard navigation
	useEffect(() => {
		const handleKeyDown = (event: KeyboardEvent) => {
			if (!tabsRef.current?.contains(event.target as Node)) return;

			const currentIndex = tabs.findIndex(tab => tab.value === activeTab);
			let newIndex = currentIndex;

			switch (event.key) {
				case 'ArrowLeft':
					newIndex = Math.max(0, currentIndex - 1);
					break;
				case 'ArrowRight':
					newIndex = Math.min(tabs.length - 1, currentIndex + 1);
					break;
				case 'Home':
					newIndex = 0;
					break;
				case 'End':
					newIndex = tabs.length - 1;
					break;
				case 'Enter':
				case ' ':
					event.preventDefault();
					// Tab is already active, no need to change
					return;
				default:
					return;
			}

			event.preventDefault();
			if (newIndex !== currentIndex) {
				onTabChange(tabs[newIndex].value);
			}
		};

		document.addEventListener('keydown', handleKeyDown);
		return () => document.removeEventListener('keydown', handleKeyDown);
	}, [tabs, activeTab, onTabChange]);

	// Scroll active tab into view on mobile
	useEffect(() => {
		if (activeTabRef.current && tabsRef.current) {
			activeTabRef.current.scrollIntoView({
				behavior: 'smooth',
				block: 'nearest',
				inline: 'center'
			});
		}
	}, [activeTab]);

	const handleTabClick = (tabValue: string) => {
		onTabChange(tabValue);
	};

	return (
		<div
			ref={tabsRef}
			role="tablist"
			aria-label="Conference navigation"
			className={cn(
				"flex gap-2 overflow-x-auto scrollbar-hide snap-x snap-mandatory",
				"bg-gray-50 dark:bg-gray-900 rounded-lg p-2",
				"border border-gray-200 dark:border-gray-700",
				"sticky top-0 z-10",
				className
			)}
		>
			{tabs.map((tab) => {
				const isActive = activeTab === tab.value;
				return (
					<button
						key={tab.value}
						ref={isActive ? activeTabRef : null}
						role="tab"
						{...(isActive ? { 'aria-selected': 'true' } : {})}
						aria-controls={`tabpanel-${tab.value}`}
						id={`tab-${tab.value}`}
						tabIndex={isActive ? 0 : -1}
						onClick={() => handleTabClick(tab.value)}
						className={cn(
							"px-4 py-3 sm:py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all duration-200",
							"min-w-0 flex-shrink-0 snap-center min-h-[44px] sm:min-h-[40px]", // Touch-friendly minimum height
							"focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2",
							"hover:scale-105 active:scale-95",
							isActive
								? "bg-blue-500 text-white shadow-lg transform scale-105"
								: "bg-gray-800 text-gray-300 hover:bg-gray-700 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
						)}
					>
						{tab.label}
					</button>
				);
			})}
		</div>
	);
}
