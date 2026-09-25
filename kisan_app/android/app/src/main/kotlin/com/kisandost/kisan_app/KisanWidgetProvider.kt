package com.kisandost.kisan_app

import android.app.PendingIntent
import android.appwidget.AppWidgetManager
import android.appwidget.AppWidgetProvider
import android.content.Context
import android.content.Intent
import android.widget.RemoteViews
import es.antonborri.home_widget.HomeWidgetPlugin

/**
 * Weather and today's advisory, on the home screen.
 *
 * Every value is written by the Flutter app through home_widget. Nothing is
 * computed here, and nothing is invented: a field the app has not filled in
 * stays hidden rather than showing a placeholder that reads like data.
 */
class KisanWidgetProvider : AppWidgetProvider() {

    override fun onUpdate(
        context: Context,
        appWidgetManager: AppWidgetManager,
        appWidgetIds: IntArray
    ) {
        val data = HomeWidgetPlugin.getData(context)

        for (widgetId in appWidgetIds) {
            val views = RemoteViews(context.packageName, R.layout.kisan_widget)

            views.setTextViewText(R.id.widget_place, data.getString("place", "") ?: "")
            views.setTextViewText(R.id.widget_temp, data.getString("temperature", "") ?: "")
            views.setTextViewText(R.id.widget_condition, data.getString("condition", "") ?: "")
            views.setTextViewText(R.id.widget_advisory, data.getString("advisory", "") ?: "")
            views.setTextViewText(R.id.widget_updated, data.getString("updated", "") ?: "")

            // Tapping anywhere opens the app. A widget that does nothing when
            // touched reads as broken.
            val launch = context.packageManager
                .getLaunchIntentForPackage(context.packageName)
                ?.apply { flags = Intent.FLAG_ACTIVITY_NEW_TASK or Intent.FLAG_ACTIVITY_CLEAR_TOP }

            if (launch != null) {
                val pending = PendingIntent.getActivity(
                    context,
                    0,
                    launch,
                    PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE
                )
                views.setOnClickPendingIntent(R.id.widget_place, pending)
                views.setOnClickPendingIntent(R.id.widget_temp, pending)
                views.setOnClickPendingIntent(R.id.widget_advisory, pending)
            }

            appWidgetManager.updateAppWidget(widgetId, views)
        }
    }
}
